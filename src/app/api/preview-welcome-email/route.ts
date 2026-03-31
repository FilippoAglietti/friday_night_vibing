/**
 * GET /api/preview-welcome-email
 * ─────────────────────────────────────────────────────────────
 * Preview the welcome email template in the browser.
 * Only available in development mode.
 * ─────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { generateWelcomeEmail } from "@/lib/emails/welcome-email";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const html = generateWelcomeEmail({
    email: "demo@example.com",
    userName: "Gianmarco",
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
