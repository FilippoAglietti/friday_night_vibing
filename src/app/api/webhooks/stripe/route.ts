/**
 * app/api/webhooks/stripe/route.ts
 * ─────────────────────────────────────────────────────────────
 * Stripe webhook handler for Syllabi.
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
import { FIVE_PACK_CREDIT_EUR, FIVE_PACK_CREDIT_WINDOW_DAYS } from "@/lib/pricing/tiers";
import { resolvePriceId, capForTier } from "./resolvePriceId";

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

      const { plan, interval } = resolvePriceId(priceId);
      console.log(
        `[stripe-webhook] Checkout completed for user ${userId}, price: ${priceId}, plan: ${plan}, interval: ${interval}`
      );

      if (plan === "planner_body_unlock") {
        const courseId = session.metadata?.courseId;
        if (!courseId) {
          console.error("[stripe-webhook] body_unlock session missing courseId in metadata");
          break;
        }
        await supabaseAdmin
          .from("courses")
          .update({
            body_unlock_purchased: true,
            body_unlock_purchased_at: new Date().toISOString(),
            body_unlock_stripe_session_id: session.id,
          })
          .eq("id", courseId)
          .eq("user_id", userId);

        const { inngest } = await import("@/lib/inngest/client");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (inngest as any).send({
          name: "course/body-unlock.requested",
          data: { courseId, userId },
        });

        console.log(`[stripe-webhook] Body unlock purchased for course ${courseId}`);
        break;
      }

      if (plan === "masterclass_5pack") {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("generations_limit, generations_used, plan")
          .eq("id", userId)
          .single();

        const currentLimit = profile?.generations_limit ?? 0;
        const nextLimit = currentLimit + 5;

        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "masterclass",
            generations_limit: nextLimit,
            white_label: true,
            stripe_customer_id: session.customer as string,
            billing_period: "one_time",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        const expiresAt = new Date(Date.now() + FIVE_PACK_CREDIT_WINDOW_DAYS * 86400_000).toISOString();
        await supabaseAdmin
          .from("conversion_credits")
          .upsert(
            {
              user_id: userId,
              source_purchase_stripe_session_id: session.id,
              amount_eur: FIVE_PACK_CREDIT_EUR,
              expires_at: expiresAt,
              redeemed: false,
            },
            { onConflict: "source_purchase_stripe_session_id" }
          );

        console.log(
          `[stripe-webhook] 5-Pack purchased by ${userId}: +5 generations, credit expires ${expiresAt}`
        );
        break;
      }

      if (plan === "masterclass") {
        const cap = capForTier("masterclass", interval);
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "masterclass",
            generations_limit: cap,
            generations_used: 0,
            white_label: true,
            stripe_customer_id: session.customer as string,
            billing_period: interval === "year" ? "annual" : "monthly",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(
          `[stripe-webhook] Upgraded user ${userId} to Masterclass ${interval === "year" ? "annual" : "monthly"} (cap=${cap})`
        );
        break;
      }

      if (plan === "planner") {
        const cap = capForTier("planner", interval);
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "planner",
            generations_limit: cap,
            generations_used: 0,
            white_label: false,
            stripe_customer_id: session.customer as string,
            billing_period: interval === "year" ? "annual" : "monthly",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(
          `[stripe-webhook] Upgraded user ${userId} to Planner ${interval === "year" ? "annual" : "monthly"} (cap=${cap})`
        );
        break;
      }

      console.warn(
        `[stripe-webhook] Unknown plan for price ${priceId}; no profile update performed.`
      );
      break;
    }

    // ─────────────────────────────────────────────────────────
    // INVOICE PAID — Subscription renewed successfully
    // ─────────────────────────────────────────────────────────
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      if (invoice.billing_reason === "subscription_create") {
        console.log("[stripe-webhook] Skipping invoice.paid for new subscription (handled by checkout)");
        break;
      }

      const userId = await findUserByCustomerId(supabaseAdmin, customerId);
      if (!userId) {
        console.warn(`[stripe-webhook] invoice.paid: no user found for customer ${customerId}`);
        break;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const renewalPriceId = (invoice.lines?.data?.[0] as any)?.price?.id || "";
      const { plan: renewalPlan, interval: renewalInterval } = resolvePriceId(renewalPriceId);

      if (renewalPlan === "masterclass") {
        const cap = capForTier("masterclass", renewalInterval);
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "masterclass",
            generations_limit: cap,
            generations_used: 0,
            white_label: true,
            billing_period: renewalInterval === "year" ? "annual" : "monthly",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const discounts = (invoice as any).discount
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? [(invoice as any).discount]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : ((invoice as any).discounts || []);
        const hasConversionCredit = discounts.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (d: any) => d?.coupon?.id === "masterclass_5pack_conversion_credit"
        );
        if (hasConversionCredit) {
          await supabaseAdmin
            .from("conversion_credits")
            .update({
              redeemed: true,
              redeemed_at: new Date().toISOString(),
              redeemed_stripe_invoice_id: invoice.id,
            })
            .eq("user_id", userId)
            .eq("redeemed", false);
        }

        console.log(
          `[stripe-webhook] Invoice paid — Masterclass ${renewalInterval} for ${userId} (cap=${cap}, credit=${hasConversionCredit})`
        );
        break;
      }

      if (renewalPlan === "planner") {
        const cap = capForTier("planner", renewalInterval);
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "planner",
            generations_limit: cap,
            generations_used: 0,
            white_label: false,
            billing_period: renewalInterval === "year" ? "annual" : "monthly",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        console.log(
          `[stripe-webhook] Invoice paid — Planner ${renewalInterval} for ${userId} (cap=${cap})`
        );
        break;
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

      if (subscription.cancel_at_period_end) {
        console.log(`[stripe-webhook] Subscription set to cancel at period end for user ${userId}`);
        break;
      }

      const currentPriceId = subscription.items.data[0]?.price?.id || "";
      const { plan, interval } = resolvePriceId(currentPriceId);

      const { data: currentProfile } = await supabaseAdmin
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .single();
      const previousPlan = currentProfile?.plan as
        | "free"
        | "planner"
        | "masterclass"
        | "enterprise"
        | null;

      if (plan === "planner") {
        const tierChanged = previousPlan !== "planner";
        const cap = capForTier("planner", interval);
        const updatePayload: Record<string, unknown> = {
          plan: "planner",
          generations_limit: cap,
          white_label: false,
          billing_period: interval === "year" ? "annual" : "monthly",
          updated_at: new Date().toISOString(),
        };
        if (tierChanged) updatePayload.generations_used = 0;
        await supabaseAdmin.from("profiles").update(updatePayload).eq("id", userId);
        console.log(
          `[stripe-webhook] Subscription updated — user ${userId} on planner ${interval}${
            tierChanged ? " (tier change, counter reset)" : ""
          }`
        );
        break;
      }

      if (plan === "masterclass") {
        const tierChanged = previousPlan !== "masterclass";
        const cap = capForTier("masterclass", interval);
        const updatePayload: Record<string, unknown> = {
          plan: "masterclass",
          generations_limit: cap,
          white_label: true,
          billing_period: interval === "year" ? "annual" : "monthly",
          updated_at: new Date().toISOString(),
        };
        if (tierChanged) updatePayload.generations_used = 0;
        await supabaseAdmin.from("profiles").update(updatePayload).eq("id", userId);
        console.log(
          `[stripe-webhook] Subscription updated — user ${userId} on masterclass ${interval}${
            tierChanged ? " (tier change, counter reset)" : ""
          }`
        );
        break;
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
          generations_limit: 1,
          white_label: false, // Free tier = branded exports
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      console.log(`[stripe-webhook] Downgraded user ${userId} to free (white_label=false)`);
      break;
    }

    default:
      console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
