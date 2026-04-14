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

// ─── Canonical EUR price IDs (source of truth) ────────────────
// All pricing migrated to EUR on 2026-04-09. USD price IDs were deprecated
// in the same cutover. These are hard-coded here as a backstop in case the
// NEXT_PUBLIC_STRIPE_*_PRICE_ID env vars are missing or misconfigured on
// Vercel — the webhook MUST always resolve a known price ID to a plan,
// otherwise invoice.paid events for existing subscribers would downgrade
// them to `unknown` and their monthly renewals would silently break.
const EUR_PRICE_IDS = {
  pro: "price_1TKBpS3kBvceiBKLANxOEgzs", // €28/mo
  fivePack: "price_1TKBpT3kBvceiBKLgw6NIFap", // €33 one-time
  proMax: "price_1TKBpU3kBvceiBKLmKdWHeub", // €69/mo
} as const;

type ResolvedPlan = "pro" | "5pack" | "promax" | "unknown";
type BillingInterval = "month" | "year" | "one_time";

/**
 * Annual Pro quota — 15 generations/month × 12 months. Granted upfront on
 * purchase and on every yearly renewal. Annual Pro Max stays unlimited (-1),
 * so this only affects the Pro tier.
 */
const PRO_MONTHLY_QUOTA = 15;
const PRO_ANNUAL_QUOTA = PRO_MONTHLY_QUOTA * 12;

/**
 * Resolves a Stripe price ID into our internal plan + billing interval.
 *
 * Env vars win (ops-rotatable without redeploy); the EUR backstop covers
 * the monthly tier only. Annual price IDs must always come from env vars
 * since they're created at launch time — no hard-coded fallback for annual.
 */
function resolvePriceId(priceId: string): { plan: ResolvedPlan; interval: BillingInterval } {
  const proMonthly = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "";
  const proAnnual = process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID || "";
  const fivePack = process.env.NEXT_PUBLIC_STRIPE_5PACK_PRICE_ID || "";
  const proMaxMonthly = process.env.NEXT_PUBLIC_STRIPE_PROMAX_PRICE_ID || "";
  const proMaxAnnual = process.env.NEXT_PUBLIC_STRIPE_PROMAX_ANNUAL_PRICE_ID || "";

  // ── 1) Env var match (ops-rotatable) ────────────────────────
  if (priceId && priceId === proMonthly) return { plan: "pro", interval: "month" };
  if (priceId && priceId === proAnnual) return { plan: "pro", interval: "year" };
  if (priceId && priceId === fivePack) return { plan: "5pack", interval: "one_time" };
  if (priceId && priceId === proMaxMonthly) return { plan: "promax", interval: "month" };
  if (priceId && priceId === proMaxAnnual) return { plan: "promax", interval: "year" };

  // ── 2) Hard-coded EUR backstop (monthly only) ───────────────
  if (priceId === EUR_PRICE_IDS.pro) return { plan: "pro", interval: "month" };
  if (priceId === EUR_PRICE_IDS.fivePack) return { plan: "5pack", interval: "one_time" };
  if (priceId === EUR_PRICE_IDS.proMax) return { plan: "promax", interval: "month" };

  // ── 3) Unknown — webhook will log + skip ────────────────────
  return { plan: "unknown", interval: "month" };
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
            white_label: true, // 5-Pack buyers get white-label exports
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(
          `[stripe-webhook] 5-Pack purchased by ${userId}: plan=pro_max, limit ${currentLimit} → ${nextLimit}, white_label=true`
        );
      } else if (plan === "promax") {
        // ── Pro Max monthly subscription: unlimited (-1) ──
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro_max",
            generations_limit: -1,
            white_label: true,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(`[stripe-webhook] Upgraded user ${userId} to Pro Max monthly (unlimited, white_label=true)`);
      } else if (plan === "pro") {
        // ── Pro subscription ─────────────────────────────────
        // Monthly: 15 generations/month, reset each invoice.paid.
        // Annual:  180 generations/year, granted upfront, reset on
        //          the yearly invoice.paid. Matches "15/mo" in aggregate
        //          without forcing us to run a monthly cron for annual
        //          subscribers.
        const quota = interval === "year" ? PRO_ANNUAL_QUOTA : PRO_MONTHLY_QUOTA;
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro",
            generations_limit: quota,
            white_label: false, // Pro keeps Syllabi branding
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(
          `[stripe-webhook] Upgraded user ${userId} to Pro ${interval === "year" ? "annual" : "monthly"} (${quota} generations, white_label=false)`
        );
      } else {
        console.warn(`[stripe-webhook] Unknown plan for price ${priceId}, treating as Pro monthly`);
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro",
            generations_limit: PRO_MONTHLY_QUOTA,
            white_label: false,
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

      // Figure out which plan AND interval the renewal corresponds to.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const renewalPriceId = (invoice.lines?.data?.[0] as any)?.price?.id || "";
      const { plan: renewalPlan, interval: renewalInterval } = resolvePriceId(renewalPriceId);

      // CRITICAL: reset generations_used on every renewal so the budget
      // actually resets. Without this, a Pro user who hits their quota
      // in month 1 stays blocked forever despite renewing.
      //
      // Monthly cycle  → reset every month → fresh 15
      // Annual cycle   → reset every year → fresh 180 (= 15 × 12)
      // Pro Max        → unlimited regardless of interval
      if (renewalPlan === "promax") {
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro_max",
            generations_limit: -1,
            generations_used: 0, // fresh cycle → fresh budget
            white_label: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        console.log(
          `[stripe-webhook] Invoice paid — confirmed pro_max ${renewalInterval} for user ${userId}, counter reset`
        );
      } else {
        // Pro renewal: size quota to interval
        const quota = renewalInterval === "year" ? PRO_ANNUAL_QUOTA : PRO_MONTHLY_QUOTA;
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro",
            generations_limit: quota,
            generations_used: 0,
            white_label: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        console.log(
          `[stripe-webhook] Invoice paid — confirmed pro ${renewalInterval} for user ${userId}, reset to 0/${quota}`
        );
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

      // Sync the current plan + interval from the subscription's price.
      // Tier change (pro <-> pro_max) → reset counter to 0.
      // Interval change on the same tier (monthly <-> annual) → re-size
      //   the Pro quota (15 ↔ 180) but leave the counter alone so we
      //   don't accidentally re-grant or revoke budget mid-cycle; the
      //   next invoice.paid will reset cleanly at the cycle boundary.
      // Cosmetic update (same tier + interval) → no-op on counter.
      const currentPriceId = subscription.items.data[0]?.price?.id || "";
      const { plan, interval } = resolvePriceId(currentPriceId);

      const { data: currentProfile } = await supabaseAdmin
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .single();
      const previousPlan = currentProfile?.plan as "free" | "pro" | "pro_max" | null;

      if (plan === "pro") {
        const tierChanged = previousPlan !== "pro";
        const quota = interval === "year" ? PRO_ANNUAL_QUOTA : PRO_MONTHLY_QUOTA;
        const updatePayload: Record<string, unknown> = {
          plan: "pro",
          generations_limit: quota,
          white_label: false,
          updated_at: new Date().toISOString(),
        };
        if (tierChanged) updatePayload.generations_used = 0;
        await supabaseAdmin
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId);
        console.log(
          `[stripe-webhook] Subscription updated — user ${userId} on pro ${interval}${tierChanged ? " (tier change, counter reset)" : ""}`
        );
      } else if (plan === "promax") {
        const tierChanged = previousPlan !== "pro_max";
        const updatePayload: Record<string, unknown> = {
          plan: "pro_max",
          generations_limit: -1,
          white_label: true,
          updated_at: new Date().toISOString(),
        };
        if (tierChanged) updatePayload.generations_used = 0;
        await supabaseAdmin
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId);
        console.log(
          `[stripe-webhook] Subscription updated — user ${userId} on pro_max ${interval}${tierChanged ? " (tier change, counter reset)" : ""}`
        );
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
