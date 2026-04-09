/**
 * app/api/webhooks/stripe/route.ts
 * ─────────────────────────────────────────────────────────────
 * Stripe webhook handler for Syllabi.ai.
 *
 * Handles:
 *   - checkout.session.completed → upgrades user plan in Supabase
 *   - invoice.paid → confirms subscription is active
 *   - invoice.payment_failed → flags user for retry
 *   - customer.subscription.updated → syncs plan changes
 *   - customer.subscription.deleted → downgrades to free
 *
 * POST /api/webhooks/stripe
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─── Route config ─────────────────────────────────────────────

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Looks up a user profile by Stripe customer ID.
 * Returns the profile id or null if not found.
 */
async function findUserByCustomerId(
  supabaseAdmin: SupabaseClient,
  customerId: string
): Promise<string | null> {
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId);

  return profiles && profiles.length > 0 ? profiles[0].id : null;
}

/**
 * Maps a Stripe price ID to our internal plan type.
 * Uses env vars for the active price IDs (launch or original).
 */
function getPlanFromPriceId(priceId: string): "pro" | "5pack" | "promax" | "unknown" {
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "";
  const fivePackPriceId = process.env.NEXT_PUBLIC_STRIPE_5PACK_PRICE_ID || "";
  const proMaxPriceId = process.env.NEXT_PUBLIC_STRIPE_PROMAX_PRICE_ID || "";

  if (priceId === proPriceId) return "pro";
  if (priceId === fivePackPriceId) return "5pack";
  if (priceId === proMaxPriceId) return "promax";

  // Fallback: check if the price ID matches any known original/launch/EUR IDs
  // Pro price IDs (original USD + launch USD + EUR)
  if (["price_1THTSs3kBvceiBKLWaWvcHef", "price_1THU2d3kBvceiBKLeH3Hrq1l", "price_1TKBpS3kBvceiBKLANxOEgzs"].includes(priceId)) return "pro";
  // 5-Pack price IDs (original USD + launch USD + EUR)
  if (["price_1THTSs3kBvceiBKLi04yrG5U", "price_1THU2e3kBvceiBKLZByaCJhs", "price_1TKBpT3kBvceiBKLgw6NIFap"].includes(priceId)) return "5pack";
  // Pro Max price IDs (original USD + launch USD + EUR)
  if (["price_1THTSt3kBvceiBKLu18Yziia", "price_1THU2f3kBvceiBKL88FKLczZ", "price_1TKBpU3kBvceiBKLmKdWHeub"].includes(priceId)) return "promax";

  return "unknown";
}

// ─── Route handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // ── Verify webhook signature ──────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // ── Handle events ─────────────────────────────────────────
  switch (event.type) {
    // ─────────────────────────────────────────────────────────
    // CHECKOUT COMPLETED — User paid successfully
    // ─────────────────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const priceId = session.metadata?.priceId || "";

      if (!userId || userId === "anonymous") {
        console.warn("[stripe-webhook] No userId in session metadata, skipping profile update");
        break;
      }

      const plan = getPlanFromPriceId(priceId);
      console.log(`[stripe-webhook] Checkout completed for user ${userId}, price: ${priceId}, plan: ${plan}`);

      if (plan === "5pack") {
        // ── 5-Pack (Pro Max one-time): adds 5 premium generations and
        //    promotes the profile to the "pro_max" tier so quality flags
        //    downstream can unlock masterclass features. Stacks on any
        //    existing positive balance (free users start at 3, pro_max
        //    buyers at 0 or whatever they had left). If the user already
        //    has unlimited pro_max (limit < 0), we leave the limit alone.
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("generations_limit, plan")
          .eq("id", userId)
          .single();

        const currentLimit = profile?.generations_limit ?? 0;
        const nextLimit = currentLimit < 0 ? currentLimit : currentLimit + 5;

        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro_max",
            generations_limit: nextLimit,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(
          `[stripe-webhook] 5-Pack purchased by ${userId}: plan=pro_max, limit ${currentLimit} → ${nextLimit}`
        );
      } else if (plan === "promax") {
        // ── Pro Max monthly subscription: unlimited (-1) ──
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro_max",
            generations_limit: -1,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(`[stripe-webhook] Upgraded user ${userId} to Pro Max monthly (unlimited)`);
      } else if (plan === "pro") {
        // ── Pro monthly subscription: 15 generations/month ──
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro",
            generations_limit: 15,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(`[stripe-webhook] Upgraded user ${userId} to Pro monthly (15 generations)`);
      } else {
        console.warn(`[stripe-webhook] Unknown plan for price ${priceId}, treating as Pro`);
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro",
            generations_limit: 15,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }

      break;
    }

    // ─────────────────────────────────────────────────────────
    // INVOICE PAID — Subscription renewed successfully
    // ─────────────────────────────────────────────────────────
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Skip the first invoice — already handled by checkout.session.completed
      if (invoice.billing_reason === "subscription_create") {
        console.log("[stripe-webhook] Skipping invoice.paid for new subscription (handled by checkout)");
        break;
      }

      const userId = await findUserByCustomerId(supabaseAdmin, customerId);
      if (!userId) {
        console.warn(`[stripe-webhook] invoice.paid: no user found for customer ${customerId}`);
        break;
      }

      // Figure out which plan the renewal corresponds to so we can
      // re-confirm the correct tier (pro vs pro_max monthly).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const renewalPriceId = (invoice.lines?.data?.[0] as any)?.price?.id || "";
      const renewalPlan = getPlanFromPriceId(renewalPriceId);

      // CRITICAL: reset generations_used on every monthly renewal so the
      // 15 gen/month budget actually means "per month" and not "per
      // lifetime of the subscription". Without this reset, a Pro user
      // hitting 15 in month 1 stays blocked forever despite renewing.
      //
      // We reset on any non-initial invoice.paid (the initial one is
      // filtered out above via billing_reason === "subscription_create").
      // subscription_cycle is the normal monthly renewal.
      if (renewalPlan === "promax") {
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro_max",
            generations_limit: -1,
            generations_used: 0, // fresh month → fresh budget
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        console.log(`[stripe-webhook] Invoice paid — confirmed pro_max for user ${userId}, counter reset to 0`);
      } else {
        // Default: Pro monthly renewal (€28/mo → 15 generations)
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro",
            generations_limit: 15,
            generations_used: 0, // fresh month → fresh 15 generations
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        console.log(`[stripe-webhook] Invoice paid — confirmed pro for user ${userId}, counter reset to 0`);
      }
      break;
    }

    // ─────────────────────────────────────────────────────────
    // INVOICE PAYMENT FAILED — Card declined on renewal
    // ─────────────────────────────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const userId = await findUserByCustomerId(supabaseAdmin, customerId);
      if (!userId) {
        console.warn(`[stripe-webhook] invoice.payment_failed: no user found for customer ${customerId}`);
        break;
      }

      // Don't immediately downgrade — Stripe retries up to 3 times.
      // Log the event so we can track it, but keep the user on pro
      // until subscription.deleted fires after all retries fail.
      console.warn(`[stripe-webhook] Payment failed for user ${userId} (attempt ${invoice.attempt_count}). Stripe will retry.`);

      // Log a usage event for monitoring
      await supabaseAdmin
        .from("usage_events")
        .insert({
          user_id: userId,
          event_type: "payment_failed",
          metadata: {
            attempt_count: invoice.attempt_count,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
          },
        });

      break;
    }

    // ─────────────────────────────────────────────────────────
    // SUBSCRIPTION UPDATED — Plan changed (upgrade/downgrade)
    // ─────────────────────────────────────────────────────────
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const userId = await findUserByCustomerId(supabaseAdmin, customerId);
      if (!userId) {
        console.warn(`[stripe-webhook] subscription.updated: no user found for customer ${customerId}`);
        break;
      }

      // Check if subscription is being cancelled at period end
      if (subscription.cancel_at_period_end) {
        console.log(`[stripe-webhook] Subscription set to cancel at period end for user ${userId}`);
        // Don't downgrade yet — they keep access until the period ends
        break;
      }

      // Sync the current plan from the subscription's price.
      // When the tier actually CHANGES (pro <-> pro_max) we also reset
      // generations_used to 0 so the user gets a fair fresh budget on
      // their new plan. If the price stays the same (cosmetic update
      // like payment method change), we leave the counter alone.
      const currentPriceId = subscription.items.data[0]?.price?.id || "";
      const plan = getPlanFromPriceId(currentPriceId);

      // Read the user's current plan to detect a real tier change
      const { data: currentProfile } = await supabaseAdmin
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .single();
      const previousPlan = currentProfile?.plan as "free" | "pro" | "pro_max" | null;

      if (plan === "pro") {
        const tierChanged = previousPlan !== "pro";
        const updatePayload: Record<string, unknown> = {
          plan: "pro",
          generations_limit: 15,
          updated_at: new Date().toISOString(),
        };
        if (tierChanged) updatePayload.generations_used = 0;
        await supabaseAdmin
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId);
        console.log(`[stripe-webhook] Subscription updated — user ${userId} on pro${tierChanged ? " (tier change, counter reset)" : ""}`);
      } else if (plan === "promax") {
        const tierChanged = previousPlan !== "pro_max";
        const updatePayload: Record<string, unknown> = {
          plan: "pro_max",
          generations_limit: -1,
          updated_at: new Date().toISOString(),
        };
        if (tierChanged) updatePayload.generations_used = 0;
        await supabaseAdmin
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId);
        console.log(`[stripe-webhook] Subscription updated — user ${userId} on pro_max${tierChanged ? " (tier change, counter reset)" : ""}`);
      }

      break;
    }

    // ─────────────────────────────────────────────────────────
    // SUBSCRIPTION DELETED — Cancelled (after all retries)
    // ─────────────────────────────────────────────────────────
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const userId = await findUserByCustomerId(supabaseAdmin, customerId);
      if (!userId) {
        console.warn(`[stripe-webhook] subscription.deleted: no user found for customer ${customerId}`);
        break;
      }

      await supabaseAdmin
        .from("profiles")
        .update({
          plan: "free",
          generations_limit: 3, // Updated default per latest product spec
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      console.log(`[stripe-webhook] Downgraded user ${userId} to free`);
      break;
    }

    default:
      console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
