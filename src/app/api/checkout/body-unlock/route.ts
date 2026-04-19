/**
 * app/api/checkout/body-unlock/route.ts
 * ─────────────────────────────────────────────────────────────
 * Planner-tier body unlock: creates a Stripe Checkout Session for
 * a one-time €5 purchase that regenerates module bodies for a
 * specific course.
 *
 * POST /api/checkout/body-unlock
 * Body: { courseId: string }
 * Returns: { url: string } — Stripe-hosted checkout URL
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
        set() {
          // read-only
        },
        remove() {
          // read-only
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
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { courseId } = await req.json();
    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json({ error: "courseId required" }, { status: 400 });
    }

    const { user, supabase } = await getUserAndSupabase();
    if (!user) {
      return NextResponse.json({ error: "auth required" }, { status: 401 });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("id, user_id, status, body_unlock_purchased, length")
      .eq("id", courseId)
      .single();

    if (!course || course.user_id !== user.id) {
      return NextResponse.json({ error: "course not found" }, { status: 404 });
    }
    if (course.body_unlock_purchased) {
      return NextResponse.json({ error: "body already unlocked" }, { status: 409 });
    }
    if (course.length === "masterclass") {
      // Per spec §14.1: masterclass-length bodies require Masterclass tier, not €5 unlock.
      return NextResponse.json(
        { error: "masterclass_length_requires_subscription" },
        { status: 422 }
      );
    }

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PLANNER_BODY_UNLOCK_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "body_unlock price not configured" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/course/${courseId}?body_unlock=success`,
      cancel_url: `${appUrl}/course/${courseId}?body_unlock=cancelled`,
      customer_email: user.email ?? undefined,
      metadata: {
        userId: user.id,
        priceId,
        courseId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create body-unlock session";
    console.error("[/api/checkout/body-unlock] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
