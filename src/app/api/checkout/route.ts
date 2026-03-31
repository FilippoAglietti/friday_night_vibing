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

// ─── Stripe client ────────────────────────────────────────────

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

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

    const { priceId } = await req.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json(
        { error: "priceId is required" },
        { status: 400 }
      );
    }

    // Get authenticated user (optional — allows anonymous checkout)
    const user = await getUser();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Determine if this is a subscription or one-time payment
    // Compare against the known 5-pack price ID from env, otherwise check Stripe price object
    const fivePackPriceId = process.env.NEXT_PUBLIC_STRIPE_5PACK_PRICE_ID || "";
    const isOneTime = priceId === fivePackPriceId || priceId.includes("5pack");
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
