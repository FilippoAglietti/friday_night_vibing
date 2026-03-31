/**
 * app/auth/callback/route.ts
 * ─────────────────────────────────────────────────────────────
 * OAuth callback handler for Supabase Auth.
 *
 * After Google OAuth redirect (or email verification), Supabase
 * sends the user back here with a `code` query parameter. We
 * exchange it for a session, detect new users, send a welcome
 * email, and redirect to the home page.
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
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
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is a new user and send welcome email
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const createdAt = new Date(user.created_at);
          const now = new Date();
          const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / 1000 / 60;

          // If user was created within the last 5 minutes, they're new
          if (minutesSinceCreation < 5) {
            const userName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "";

            // Fire-and-forget: don't block redirect on email sending
            fetch(`${origin}/api/send-welcome-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
              },
              body: JSON.stringify({
                email: user.email,
                userName,
              }),
            }).catch((err) =>
              console.error("[auth/callback] Welcome email failed:", err)
            );
          }
        }
      } catch (emailErr) {
        // Don't block auth flow if email check fails
        console.error("[auth/callback] Welcome email check failed:", emailErr);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[auth/callback] Code exchange error:", error);
  }

  // Redirect to home with error indication
  return NextResponse.redirect(`${origin}/?auth_error=true`);
}
