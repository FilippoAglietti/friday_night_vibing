/**
 * app/api/webhooks/stripe/route.ts
 * ─────────────────────────────────────────────────────────────
 * Stripe webhook handler for Syllabi.ai.
 *
 * Handles:
 *   - checkout.session.completed → upgrades user plan in Supabase
 *
 * POST /api/webhooks/stripe
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ─── Route config ─────────────────────────────────────────────

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic";

// ─── Route handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
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
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const priceId = session.metadata?.priceId;

      if (!userId || userId === "anonymous") {
        console.warn("[stripe-webhook] No userId in session metadata, skipping profile update");
        break;
      }

      console.log(`[stripe-webhook] Checkout completed for user ${userId}, price: ${priceId}`);

      if (priceId?.includes("5pack")) {
        // ── 5-Pack: Add 5 generations to the user's limit ──
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("generations_limit")
          .eq("id", userId)
          .single();

        const currentLimit = profile?.generations_limit ?? 1;

        await supabaseAdmin
          .from("profiles")
          .update({
            generations_limit: currentLimit + 5,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(`[stripe-webhook] Added 5 generations for user ${userId}`);
      } else {
        // ── Pro subscription: Set plan to pro with unlimited generations ──
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro",
            generations_limit: 999999,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(`[stripe-webhook] Upgraded user ${userId} to Pro`);
      }

      break;
    }

    case "customer.subscription.deleted": {
      // ── Pro cancellation: Downgrade to free ──
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId);

      if (profiles && profiles.length > 0) {
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "free",
            generations_limit: 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profiles[0].id);

        console.log(`[stripe-webhook] Downgraded user ${profiles[0].id} to free`);
      }
      break;
    }

    default:
      console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
