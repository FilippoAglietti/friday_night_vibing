import type { Curriculum } from "@/types/curriculum";

export type ExportPath = "sync" | "async";

// cover + TOC + one page per module opener + one page per lesson
export function estimatePageCount(curriculum: Curriculum): number {
  const coverAndToc = 2;
  const moduleOpeners = curriculum.modules.length;
  const lessonPages = curriculum.modules.reduce(
    (n, m) => n + (m.lessons?.length ?? 0),
    0,
  );
  return coverAndToc + moduleOpeners + lessonPages;
}

export function decideExportPath(curriculum: Curriculum): ExportPath {
  return estimatePageCount(curriculum) > 30 ? "async" : "sync";
}
