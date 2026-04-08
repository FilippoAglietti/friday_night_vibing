import { Curriculum } from "@/types/curriculum";

// ── Lead Magnet Settings ─────────────────────────────────────

export interface LeadMagnetSettings {
  /** When true, course content is gated behind an email capture */
  enabled: boolean;
  /** Headline shown above the email form (default: "Get free access to this course") */
  headline?: string;
  /** Optional sub-text below the headline */
  description?: string;
  /** CTA button text (default: "Unlock Course") */
  ctaText?: string;
  /** Where collected emails go — later: Supabase table or webhook */
  collectTo?: "local" | "webhook";
  /** Optional webhook URL to POST collected emails */
  webhookUrl?: string;
}

export interface SharePayload {
  curriculum: Curriculum;
  leadMagnet?: LeadMagnetSettings;
}

/**
 * Generates a shareable URL for a curriculum, with optional lead-magnet settings
 */
export function generateShareableUrl(
  curriculum: Curriculum,
  leadMagnet?: LeadMagnetSettings,
): string {
  try {
    const payload: SharePayload = { curriculum };
    if (leadMagnet?.enabled) {
      payload.leadMagnet = leadMagnet;
    }
    const jsonString = JSON.stringify(payload);
    const encoded = typeof window !== "undefined"
      ? btoa(unescape(encodeURIComponent(jsonString)))
      : Buffer.from(jsonString).toString("base64");

    // Build the shareable URL
    if (typeof window !== "undefined") {
      return `${window.location.origin}/share?data=${encoded}`;
    } else {
      return `/share?data=${encoded}`;
    }
  } catch (error) {
    console.error("Failed to generate shareable URL:", error);
    return "/share";
  }
}

/**
 * Decodes a share payload from a base64-encoded query param.
 * Backwards-compatible: if the encoded data is a raw Curriculum (no wrapper),
 * it wraps it into a SharePayload automatically.
 */
export function decodeSharePayload(encodedData: string): SharePayload | null {
  try {
    // Browser-safe base64 decode (handles UTF-8 properly)
    let jsonString: string;
    if (typeof window !== "undefined") {
      jsonString = decodeURIComponent(escape(atob(encodedData)));
    } else {
      jsonString = Buffer.from(encodedData, "base64").toString("utf-8");
    }

    // Backwards compat: old URLs used btoa(encodeURIComponent(json))
    // which produces URI-encoded JSON after atob — try decoding that too
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      parsed = JSON.parse(decodeURIComponent(jsonString));
    }

    // Backwards compat: old URLs encoded a raw Curriculum (has .modules)
    if (parsed.modules && !parsed.curriculum) {
      return { curriculum: parsed as unknown as Curriculum };
    }

    return parsed as unknown as SharePayload;
  } catch (error) {
    console.error("Failed to decode share payload:", error);
    return null;
  }
}

/**
 * @deprecated Use decodeSharePayload instead — kept for backwards compat
 */
export function decodeCurriculumFromUrl(encodedData: string): Curriculum | null {
  const payload = decodeSharePayload(encodedData);
  return payload?.curriculum ?? null;
}
