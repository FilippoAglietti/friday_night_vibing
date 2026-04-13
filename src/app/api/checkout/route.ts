/**
 * app/api/checkout/route.ts
 * ─────────────────────────────────────────────────────────────
 * Creates a Stripe Checkout session for Syllabi Pro or 5-Pack.
 *
 * POST /api/checkout
 * Body: { priceId: string }
 * Returns: { url: string } — the Stripe-hosted checkout URL
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// ─── Supabase server helper ───────────────────────────────────

async function getUser() {
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
  return user;
}

// ─── Route handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Validate Stripe key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to .env.local." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { priceId } = await req.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json(
        { error: "priceId is required" },
        { status: 400 }
      );
    }

    // Validate against all known price IDs (monthly + annual where set)
    const VALID_PRICE_IDS = [
      process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_5PACK_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_PROMAX_PRICE_ID,
      process.env.NEXT_PUBLIC_STRIPE_PROMAX_ANNUAL_PRICE_ID,
    ].filter(Boolean);

    if (VALID_PRICE_IDS.length > 0 && !VALID_PRICE_IDS.includes(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Get authenticated user (optional — allows anonymous checkout)
    const user = await getUser();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Determine if this is a subscription or one-time payment
    // 5-Pack is the only one-time payment; Pro and Pro Max are subscriptions
    const fivePackPriceId = process.env.NEXT_PUBLIC_STRIPE_5PACK_PRICE_ID || "";
    const isOneTime = priceId === fivePackPriceId;
    const session = await stripe.checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
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
