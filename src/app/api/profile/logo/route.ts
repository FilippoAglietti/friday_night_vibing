/**
 * app/api/profile/logo/route.ts
 * ─────────────────────────────────────────────────────────────
 * POST   — upload a brand logo (multipart/form-data with `logo` field)
 * DELETE — remove the brand logo
 *
 * Allowed: PNG, JPG. Max 2 MB. SVG explicitly disallowed in v1 (XSS risk
 * when serving from a public bucket; revisit with sanitization in v2).
 * Path layout: logos/<user_id>/<uuid>.<ext>
 * ─────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/png", "image/jpeg"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
};

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

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Expected multipart/form-data with a 'logo' field." },
        { status: 400 }
      );
    }

    const file = form.get("logo");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Expected a 'logo' file field." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Max 2 MB." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PNG or JPG." },
        { status: 400 }
      );
    }

    const ext = MIME_TO_EXT[file.type];

    // Clean up any existing logos for this user before uploading the new one,
    // so we don't accumulate orphaned files.
    const { data: existing, error: listError } = await supabase.storage
      .from("logos")
      .list(user.id);
    if (listError) {
      console.warn("[/api/profile/logo] list failed (continuing):", listError.message);
    } else if (existing && existing.length > 0) {
      const paths = existing.map((f) => `${user.id}/${f.name}`);
      const { error: removeError } = await supabase.storage
        .from("logos")
        .remove(paths);
      if (removeError) {
        console.warn(
          "[/api/profile/logo] cleanup failed (continuing):",
          removeError.message
        );
      }
    }

    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `${user.id}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[/api/profile/logo] upload failed:", uploadError.message);
      return NextResponse.json(
        { error: "Upload failed. Please try again." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ branding_logo_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("[/api/profile/logo] profile update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to save." }, { status: 500 });
    }

    return NextResponse.json({ branding_logo_url: publicUrl });
  } catch (err) {
    console.error("[/api/profile/logo POST] unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
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

    const { data: existing, error: listError } = await supabase.storage
      .from("logos")
      .list(user.id);

    if (listError) {
      console.warn("[/api/profile/logo DELETE] list failed (continuing):", listError.message);
    } else if (existing && existing.length > 0) {
      const paths = existing.map((f) => `${user.id}/${f.name}`);
      const { error: removeError } = await supabase.storage
        .from("logos")
        .remove(paths);
      if (removeError) {
        console.warn(
          "[/api/profile/logo DELETE] storage remove failed (continuing):",
          removeError.message
        );
      }
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ branding_logo_url: null })
      .eq("id", user.id);

    if (updateError) {
      console.error("[/api/profile/logo DELETE] update failed:", updateError.message);
      return NextResponse.json({ error: "Failed to clear." }, { status: 500 });
    }

    return NextResponse.json({ branding_logo_url: null });
  } catch (err) {
    console.error("[/api/profile/logo DELETE] unexpected:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
