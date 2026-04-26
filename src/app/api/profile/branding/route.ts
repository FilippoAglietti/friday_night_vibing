/**
 * app/api/profile/branding/route.ts
 * ─────────────────────────────────────────────────────────────
 * POST /api/profile/branding — update the caller's branding_display_name.
 * Body: { branding_display_name: string | null }
 * Trims, caps at 80 chars, treats empty/whitespace as null (clears the field).
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const MAX_NAME_LEN = 80;

async function userClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
            /* read-only context */
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            /* read-only context */
          }
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await userClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as
      | { branding_display_name?: unknown }
      | null;

    if (!body || !("branding_display_name" in body)) {
      return NextResponse.json(
        { error: "Missing branding_display_name in body." },
        { status: 400 }
      );
    }

    let value: string | null;
    const raw = body.branding_display_name;
    if (raw === null) {
      value = null;
    } else if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed.length === 0) {
        value = null;
      } else if (trimmed.length > MAX_NAME_LEN) {
        return NextResponse.json(
          { error: `Name must be ${MAX_NAME_LEN} characters or fewer.` },
          { status: 400 }
        );
      } else {
        value = trimmed;
      }
    } else {
      return NextResponse.json(
        { error: "branding_display_name must be a string or null." },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ branding_display_name: value })
      .eq("id", user.id);

    if (updateError) {
      console.error("[/api/profile/branding] update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to save." }, { status: 500 });
    }

    return NextResponse.json({ branding_display_name: value });
  } catch (err) {
    console.error("[/api/profile/branding] unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
