import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/contact
 * Receives contact form submissions and forwards them to hello@syllabi.online
 * via Resend (if configured) or logs them for manual follow-up.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Try sending via Resend if API key is available
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Syllabi Contact Form <noreply@syllabi.online>",
          to: ["hello@syllabi.online"],
          reply_to: email,
          subject: `[Contact] ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p>${message.replace(/\n/g, "<br />")}</p>
          `,
        }),
      });

      if (!res.ok) {
        console.error("[contact] Resend error:", await res.text());
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // No Resend key — log the message
    console.log("[contact] Form submission:", { name, email, subject, message });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[contact] Error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
