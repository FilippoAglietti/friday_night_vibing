import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import crypto from "node:crypto";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Path convention: {userId}/{courseId}/{sha1-16}.{ext}
export async function uploadToBucket(opts: {
  buffer: Buffer;
  userId: string;
  courseId: string;
  ext: "pdf" | "zip" | "md";
  contentType: string;
}): Promise<{ signedUrl: string; path: string }> {
  const hash = crypto
    .createHash("sha1")
    .update(opts.buffer)
    .digest("hex")
    .slice(0, 16);
  const path = `${opts.userId}/${opts.courseId}/${hash}.${opts.ext}`;

  const { error: upErr } = await supabase.storage
    .from("exports")
    .upload(path, opts.buffer, {
      contentType: opts.contentType,
      upsert: true,
    });
  if (upErr) throw new Error(`upload failed: ${upErr.message}`);

  const { data, error: signErr } = await supabase.storage
    .from("exports")
    .createSignedUrl(path, 60 * 60);
  if (signErr || !data) throw new Error(`sign failed: ${signErr?.message}`);

  return { signedUrl: data.signedUrl, path };
}
