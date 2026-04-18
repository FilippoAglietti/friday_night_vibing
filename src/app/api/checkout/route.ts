/**
 * app/api/checkout/route.ts
 * ─────────────────────────────────────────────────────────────
 * Creates a Stripe Checkout session for Planner / Masterclass /
 * Masterclass 5-Pack.
 *
 * POST /api/checkout
 * Body: { priceId: string }
 * Returns: { url: string } — Stripe-hosted checkout URL
 *
 * If the user has an unredeemed 5-Pack conversion credit in
 * conversion_credits and is checking out for a Masterclass
 * subscription, the credit is applied via Stripe coupon
 * "masterclass_5pack_conversion_credit" (created in the Stripe
 * dashboard; NOT created programmatically here).
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getUserAndSupabase() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Safe to ignore in read-only contexts
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // Safe to ignore in read-only contexts
          }
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to .env.local." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { priceId } = await req.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    const VALID_PRICE_IDS = [
      process.env.NEXT_PUBLIC_STRIPE_PLANNER_MONTHLY_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_PLANNER_ANNUAL_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID,
      // Body unlock has its own route; not listed here.
    ].filter(Boolean);

    if (VALID_PRICE_IDS.length > 0 && !VALID_PRICE_IDS.includes(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    const { user, supabase } = await getUserAndSupabase();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const fivePackPriceId = process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_5PACK_PRICE_ID || "";
    const isOneTime = priceId === fivePackPriceId;

    // Auto-apply 5-Pack -> Masterclass conversion coupon if the user has an
    // unredeemed credit and is subscribing to Masterclass monthly/annual.
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    const isMasterclassSub =
      priceId === process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_MONTHLY_PRICE_ID ||
      priceId === process.env.NEXT_PUBLIC_STRIPE_MASTERCLASS_ANNUAL_PRICE_ID;

    if (user?.id && isMasterclassSub) {
      const { data: credit } = await supabase
        .from("conversion_credits")
        .select("id, expires_at")
        .eq("user_id", user.id)
        .eq("redeemed", false)
        .gt("expires_at", new Date().toISOString())
        .limit(1)
        .maybeSingle();

      if (credit) {
        discounts = [{ coupon: "masterclass_5pack_conversion_credit" }];
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(discounts && { discounts }),
      success_url: `${appUrl}?checkout=success`,
      cancel_url: `${appUrl}?checkout=cancelled`,
      ...(user?.email && { customer_email: user.email }),
      metadata: {
        userId: user?.id || "anonymous",
        priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[/api/checkout] Error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
