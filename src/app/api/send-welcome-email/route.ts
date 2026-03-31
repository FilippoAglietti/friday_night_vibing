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

const resend = new Resend(process.env.RESEND_API_KEY);

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
    if (!process.env.RESEND_API_KEY) {
      console.warn("[welcome-email] RESEND_API_KEY not set, skipping email send");
      return NextResponse.json({ success: false, reason: "Email service not configured" });
    }

    const html = generateWelcomeEmail({ email, userName });

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Syllabi.ai <welcome@syllabi.ai>",
      to: email,
      subject: "Welcome to Syllabi.ai — Let's Create Something Amazing! 🎓",
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
