/**
 * middleware.ts
 * ─────────────────────────────────────────────────────────────
 * Supabase Auth middleware for Next.js.
 *
 * Refreshes the auth token on each request to keep sessions alive.
 * Runs on all routes except static files and API webhooks
 * (webhooks need the raw body, not a modified request).
 * ─────────────────────────────────────────────────────────────
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          // Set on the request so downstream code sees the updated cookie
          req.cookies.set({ name, value, ...options });
          // Set on the response so the browser stores the updated cookie
          response = NextResponse.next({ request: req });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          req.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: req });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh the session — this is the main purpose of this middleware
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (svg, png, etc.)
     * - Stripe webhooks (need raw body)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhooks).*)",
  ],
};
