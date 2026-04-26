"use client";

/**
 * Trigger an export v2 PDF download for a saved course.
 * Short courses respond synchronously with a signed URL; long courses
 * respond with { status: "pending" } and we poll until ready.
 */
export async function downloadPdfV2(courseId: string): Promise<void> {
  const res = await fetch("/api/export/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId }),
  });
  const body = await res.json();

  if (body.status === "ready") {
    window.location.href = body.url;
    return;
  }
  if (body.status === "pending") {
    await pollUntilReady(courseId);
    return;
  }
  throw new Error(body.error ?? "export failed");
}

async function pollUntilReady(courseId: string): Promise<void> {
  const deadline = Date.now() + 120_000; // 2 min cap
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`/api/export/pdf/status/${courseId}`);
    const body = await res.json();
    if (body.status === "ready") {
      window.location.href = body.url;
      return;
    }
  }
  throw new Error("export did not complete within 2 minutes");
}

let warnedFlagOff = false;

export function isExportV2ClientEnabled(): boolean {
  const enabled = process.env.NEXT_PUBLIC_EXPORT_V2_ENABLED === "true";
  if (
    !enabled &&
    !warnedFlagOff &&
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production"
  ) {
    warnedFlagOff = true;
    console.warn(
      "[export] NEXT_PUBLIC_EXPORT_V2_ENABLED is not 'true' — falling back to legacy jsPDF. " +
        "Set EXPORT_V2_ENABLED=true and NEXT_PUBLIC_EXPORT_V2_ENABLED=true in Vercel + Cloud Run to enable v2."
    );
  }
  return enabled;
}
