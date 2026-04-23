import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

async function createSupabaseServer() {
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
            // set() can throw in read-only contexts — safe to ignore
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {
            // Same as above — safe to ignore
          }
        },
      },
    }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: exp } = await supabase
    .from("course_exports")
    .select("storage_path, completed_at")
    .eq("course_id", courseId)
    .eq("format", "pdf")
    .single();

  if (!exp) return NextResponse.json({ status: "pending" });

  // Always mint a fresh signed URL to avoid stale links
  const { data, error } = await supabase.storage
    .from("exports")
    .createSignedUrl(exp.storage_path, 60 * 60);

  if (error || !data) {
    return NextResponse.json({ error: "sign failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "ready", url: data.signedUrl });
}
