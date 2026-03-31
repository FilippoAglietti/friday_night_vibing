/**
 * app/api/waitlist/route.ts
 * ─────────────────────────────────────────────────────────────
 * POST /api/waitlist
 *
 * Captures lead emails for the launch campaign.
 * Saves to the waitlist table with source and UTM tracking.
 *
 * Body: { email: string, source?: string, utm?: Record<string, string> }
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin client — bypasses RLS so anyone can insert without auth
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source, utm } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Get source from query param or body
    const utmSource = req.nextUrl.searchParams.get("utm_source") ?? source ?? "direct";
    const utmParams = utm ?? {
      utm_source: req.nextUrl.searchParams.get("utm_source"),
      utm_medium: req.nextUrl.searchParams.get("utm_medium"),
      utm_campaign: req.nextUrl.searchParams.get("utm_campaign"),
    };

    // Insert into waitlist (upsert — no error if already exists)
    const { error } = await supabaseAdmin
      .from("waitlist")
      .upsert(
        {
          email: email.trim().toLowerCase(),
          source: utmSource,
          utm_params: utmParams,
        },
        { onConflict: "email", ignoreDuplicates: true }
      );

    if (error) {
      console.error("[/api/waitlist] Supabase error:", error);
      return NextResponse.json(
        { error: "Could not save your email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/waitlist] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
