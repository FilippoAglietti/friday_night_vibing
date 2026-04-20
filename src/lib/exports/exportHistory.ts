export type ExportFormatId =
  | "pdf"
  | "word"
  | "markdown"
  | "notion"
  | "scorm"
  | "nlmAudio"
  | "nlmSlides"
  | "share";

export interface ExportHistoryEntry {
  format: ExportFormatId;
  ts: number;
}

const MAX_ENTRIES = 50;
const KEY_PREFIX = "syllabi.exportHistory.";

function keyFor(courseId: string): string {
  return `${KEY_PREFIX}${courseId}`;
}

export function appendExportEvent(courseId: string, format: ExportFormatId): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(keyFor(courseId));
    const parsed: ExportHistoryEntry[] = raw ? JSON.parse(raw) : [];
    const next: ExportHistoryEntry[] = [...parsed, { format, ts: Date.now() }].slice(-MAX_ENTRIES);
    window.localStorage.setItem(keyFor(courseId), JSON.stringify(next));
  } catch {
    // Quota exceeded or JSON parse failure — silent drop, non-critical.
  }
}

export function readExportHistory(courseId: string): ExportHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(keyFor(courseId));
    return raw ? (JSON.parse(raw) as ExportHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function summarizeExportHistory(courseId: string): Array<{ format: ExportFormatId; count: number }> {
  const history = readExportHistory(courseId);
  const counts = new Map<ExportFormatId, number>();
  for (const entry of history) {
    counts.set(entry.format, (counts.get(entry.format) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([format, count]) => ({ format, count }))
    .sort((a, b) => b.count - a.count);
}
