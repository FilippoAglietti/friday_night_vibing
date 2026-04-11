/**
 * POST /api/send-welcome-email
 * ─────────────────────────────────────────────────────────────
 * Sends a premium welcome email to a newly registered user.
 * Called internally after successful auth callback.
 *
 * Body: { email: string, userName?: string }
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateWelcomeEmail } from "@/lib/emails/welcome-email";

// Lazy-init Resend inside the handler to avoid build-time errors
// when RESEND_API_KEY env var isn't available during static analysis
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function POST(req: NextRequest) {
  try {
    // Validate internal request (basic protection)
    const authHeader = req.headers.get("x-internal-secret");
    if (authHeader !== process.env.INTERNAL_API_SECRET && process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, userName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Don't send if Resend isn't configured
    const resend = getResend();
    if (!resend) {
      console.warn("[welcome-email] RESEND_API_KEY not set, skipping email send");
      return NextResponse.json({ success: false, reason: "Email service not configured" });
    }

    const html = generateWelcomeEmail({ email, userName });

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Syllabi <welcome@syllabi.online>",
      to: email,
      subject: "Welcome to Syllabi — Let's Create Something Amazing! 🎓",
      html,
    });

    if (error) {
      console.error("[welcome-email] Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    console.log("[welcome-email] Sent to", email, "id:", data?.id);
    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[welcome-email] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
