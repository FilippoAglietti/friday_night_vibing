import ExcelJS from "exceljs";
import type { Curriculum, Module, Lesson, QuizQuestion } from "@/types/curriculum";

// ── Brand Colors ────────────────────────────────────────────
const COLORS = {
  primary: "6D28D9",
  light: "8B5CF6",
  dark: "4C1D95",
  bg: "F5F3FF",
  white: "FFFFFF",
  text: "1F2937",
  lightGray: "F9FAFB",
  border: "E5E7EB",
  emerald: "059669",
  amber: "D97706",
  red: "DC2626",
};

const FONT_MAIN = "Calibri";

// ── Helpers ─────────────────────────────────────────────────

function headerFill(): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb: `FF${COLORS.primary}` } };
}

function headerFont(size = 11): Partial<ExcelJS.Font> {
  return { name: FONT_MAIN, bold: true, color: { argb: `FF${COLORS.white}` }, size };
}

function zebra(idx: number): ExcelJS.Fill | undefined {
  return idx % 2 === 1
    ? { type: "pattern", pattern: "solid", fgColor: { argb: `FF${COLORS.lightGray}` } }
    : undefined;
}

function thinBorder(): Partial<ExcelJS.Borders> {
  const side: Partial<ExcelJS.Border> = { style: "thin", color: { argb: `FF${COLORS.border}` } };
  return { top: side, bottom: side, left: side, right: side };
}

function styleHeaderRow(row: ExcelJS.Row, colCount: number) {
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    cell.fill = headerFill();
    cell.font = headerFont();
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = thinBorder();
  }
  row.height = 28;
}

function styleDataRow(row: ExcelJS.Row, colCount: number, idx: number) {
  const fill = zebra(idx);
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    if (fill) cell.fill = fill;
    cell.font = { name: FONT_MAIN, size: 10, color: { argb: `FF${COLORS.text}` } };
    cell.alignment = { vertical: "top", wrapText: true };
    cell.border = thinBorder();
  }
}

function addTitle(ws: ExcelJS.Worksheet, title: string, colSpan: number) {
  const row = ws.addRow([title]);
  ws.mergeCells(row.number, 1, row.number, colSpan);
  const cell = row.getCell(1);
  cell.font = { name: FONT_MAIN, bold: true, size: 16, color: { argb: `FF${COLORS.primary}` } };
  cell.alignment = { vertical: "middle" };
  row.height = 30;
  ws.addRow([]);
}

// ── Main Export ─────────────────────────────────────────────

export async function generateCurriculumXlsx(curriculum: Curriculum): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Syllabi.ai";
  wb.created = new Date();

  const totalLessons = curriculum.modules.reduce((a, m) => a + (m.lessons?.length || 0), 0);
  const totalQuizzes = curriculum.modules.reduce(
    (a, m) => a + (m.quiz?.length || 0) + m.lessons.reduce((b, l) => b + (l.quiz?.length || 0), 0),
    0
  );

  // ════════════════════════════════════════════════════
  //  Sheet 1: Course Overview
  // ════════════════════════════════════════════════════
  const wsOverview = wb.addWorksheet("Course Overview", {
    properties: { tabColor: { argb: `FF${COLORS.primary}` } },
  });

  addTitle(wsOverview, curriculum.title, 2);

  const overviewData = [
    ["Subtitle", curriculum.subtitle],
    ["Description", curriculum.description],
    ["Difficulty", curriculum.difficulty.charAt(0).toUpperCase() + curriculum.difficulty.slice(1)],
    ["Target Audience", curriculum.targetAudience],
    ["Modules", curriculum.modules.length],
    ["Total Lessons", totalLessons],
    ["Total Hours", curriculum.pacing?.totalHours || "N/A"],
    ["Quiz Questions", totalQuizzes],
    ["Pacing Style", curriculum.pacing?.style?.replace("-", " ") || "N/A"],
    ["Hours Per Week", curriculum.pacing?.hoursPerWeek || "N/A"],
    ["Total Weeks", curriculum.pacing?.totalWeeks || "N/A"],
    ["Tags", (curriculum.tags || []).join(", ")],
  ];

  overviewData.forEach(([label, value], idx) => {
    const row = wsOverview.addRow([label, value]);
    row.getCell(1).font = { name: FONT_MAIN, bold: true, size: 11, color: { argb: `FF${COLORS.primary}` } };
    row.getCell(2).font = { name: FONT_MAIN, size: 11, color: { argb: `FF${COLORS.text}` } };
    row.getCell(2).alignment = { wrapText: true };
    if (idx % 2 === 1) {
      const fill = zebra(1)!;
      row.getCell(1).fill = fill;
      row.getCell(2).fill = fill;
    }
    row.getCell(1).border = thinBorder();
    row.getCell(2).border = thinBorder();
  });

  wsOverview.addRow([]);
  wsOverview.addRow([]);

  // Learning Objectives
  const objHeader = wsOverview.addRow(["Learning Objectives"]);
  objHeader.getCell(1).font = { name: FONT_MAIN, bold: true, size: 13, color: { argb: `FF${COLORS.primary}` } };
  wsOverview.addRow([]);

  curriculum.objectives.forEach((obj, idx) => {
    const row = wsOverview.addRow([`${idx + 1}.`, obj]);
    row.getCell(1).font = { name: FONT_MAIN, bold: true, size: 10, color: { argb: `FF${COLORS.light}` } };
    row.getCell(2).font = { name: FONT_MAIN, size: 10, color: { argb: `FF${COLORS.text}` } };
    row.getCell(2).alignment = { wrapText: true };
  });

  wsOverview.getColumn(1).width = 22;
  wsOverview.getColumn(2).width = 70;

  // ════════════════════════════════════════════════════
  //  Sheet 2: Module Breakdown
  // ════════════════════════════════════════════════════
  const wsModules = wb.addWorksheet("Modules", {
    properties: { tabColor: { argb: `FF${COLORS.light}` } },
  });

  addTitle(wsModules, "Module Breakdown", 6);

  const modHeaders = ["#", "Module Title", "Lessons", "Duration (h)", "Objectives", "Description"];
  const modHeaderRow = wsModules.addRow(modHeaders);
  styleHeaderRow(modHeaderRow, modHeaders.length);

  curriculum.modules.forEach((mod, idx) => {
    const totalMin = mod.durationMinutes || mod.lessons.reduce((a, l) => a + l.durationMinutes, 0);
    const hrs = Math.round(totalMin / 60 * 10) / 10;
    const objectives = (mod.objectives || []).join("\n");
    const row = wsModules.addRow([
      idx + 1,
      mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, ""),
      mod.lessons.length,
      hrs,
      objectives,
      mod.description,
    ]);
    styleDataRow(row, modHeaders.length, idx);
    row.getCell(3).alignment = { horizontal: "center", vertical: "top" };
    row.getCell(4).alignment = { horizontal: "center", vertical: "top" };
  });

  wsModules.getColumn(1).width = 5;
  wsModules.getColumn(2).width = 30;
  wsModules.getColumn(3).width = 10;
  wsModules.getColumn(4).width = 12;
  wsModules.getColumn(5).width = 40;
  wsModules.getColumn(6).width = 50;

  // ════════════════════════════════════════════════════
  //  Sheet 3: All Lessons
  // ════════════════════════════════════════════════════
  const wsLessons = wb.addWorksheet("Lessons", {
    properties: { tabColor: { argb: `FF${COLORS.emerald}` } },
  });

  addTitle(wsLessons, "Lesson Details", 7);

  const lessonHeaders = ["Module", "Lesson #", "Title", "Format", "Duration (min)", "Objectives", "Key Points"];
  const lessonHeaderRow = wsLessons.addRow(lessonHeaders);
  styleHeaderRow(lessonHeaderRow, lessonHeaders.length);

  let lessonIdx = 0;
  curriculum.modules.forEach((mod) => {
    mod.lessons.forEach((lesson, li) => {
      const row = wsLessons.addRow([
        mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, ""),
        li + 1,
        lesson.title,
        lesson.format,
        lesson.durationMinutes,
        (lesson.objectives || []).join("\n"),
        (lesson.keyPoints || []).join("\n"),
      ]);
      styleDataRow(row, lessonHeaders.length, lessonIdx);
      row.getCell(2).alignment = { horizontal: "center", vertical: "top" };
      row.getCell(4).alignment = { horizontal: "center", vertical: "top" };
      row.getCell(5).alignment = { horizontal: "center", vertical: "top" };
      lessonIdx++;
    });
  });

  wsLessons.getColumn(1).width = 25;
  wsLessons.getColumn(2).width = 10;
  wsLessons.getColumn(3).width = 30;
  wsLessons.getColumn(4).width = 12;
  wsLessons.getColumn(5).width = 14;
  wsLessons.getColumn(6).width = 40;
  wsLessons.getColumn(7).width = 40;

  // ════════════════════════════════════════════════════
  //  Sheet 4: Quiz Bank
  // ════════════════════════════════════════════════════
  const wsQuiz = wb.addWorksheet("Quiz Bank", {
    properties: { tabColor: { argb: `FF${COLORS.amber}` } },
  });

  addTitle(wsQuiz, "Quiz Questions", 6);

  const quizHeaders = ["Module / Lesson", "Question", "Type", "Options", "Correct Answer", "Explanation"];
  const quizHeaderRow = wsQuiz.addRow(quizHeaders);
  styleHeaderRow(quizHeaderRow, quizHeaders.length);

  let qIdx = 0;
  curriculum.modules.forEach((mod) => {
    // Module-level quiz
    if (mod.quiz && mod.quiz.length > 0) {
      mod.quiz.forEach((q) => {
        const answerText = typeof q.correctAnswer === "number" && q.options
          ? q.options[q.correctAnswer]
          : String(q.correctAnswer);
        const row = wsQuiz.addRow([
          `Module: ${mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "")}`,
          q.question,
          q.type || "multiple-choice",
          (q.options || []).join("\n"),
          answerText,
          q.explanation || "",
        ]);
        styleDataRow(row, quizHeaders.length, qIdx);
        qIdx++;
      });
    }
    // Lesson-level quiz
    mod.lessons.forEach((lesson) => {
      if (lesson.quiz && lesson.quiz.length > 0) {
        lesson.quiz.forEach((q) => {
          const answerText = typeof q.correctAnswer === "number" && q.options
            ? q.options[q.correctAnswer]
            : String(q.correctAnswer);
          const row = wsQuiz.addRow([
            `Lesson: ${lesson.title}`,
            q.question,
            q.type || "multiple-choice",
            (q.options || []).join("\n"),
            answerText,
            q.explanation || "",
          ]);
          styleDataRow(row, quizHeaders.length, qIdx);
          qIdx++;
        });
      }
    });
  });

  wsQuiz.getColumn(1).width = 25;
  wsQuiz.getColumn(2).width = 40;
  wsQuiz.getColumn(3).width = 15;
  wsQuiz.getColumn(4).width = 35;
  wsQuiz.getColumn(5).width = 25;
  wsQuiz.getColumn(6).width = 40;

  // ════════════════════════════════════════════════════
  //  Sheet 5: Pacing Schedule
  // ════════════════════════════════════════════════════
  if (curriculum.pacing?.weeklyPlan && curriculum.pacing.weeklyPlan.length > 0) {
    const wsPacing = wb.addWorksheet("Pacing Schedule", {
      properties: { tabColor: { argb: `FF${COLORS.dark}` } },
    });

    addTitle(wsPacing, "Weekly Pacing Schedule", 4);

    const sub = wsPacing.addRow([
      `${curriculum.pacing.hoursPerWeek}h/week over ${curriculum.pacing.totalWeeks} weeks — ${curriculum.pacing.totalHours} total hours`,
    ]);
    sub.getCell(1).font = { name: FONT_MAIN, italic: true, size: 10, color: { argb: `FF${COLORS.light}` } };
    wsPacing.addRow([]);

    const pacingHeaders = ["Week", "Focus", "Hours", "Cumulative Hours"];
    const pacingHeaderRow = wsPacing.addRow(pacingHeaders);
    styleHeaderRow(pacingHeaderRow, pacingHeaders.length);

    let cumHours = 0;
    curriculum.pacing.weeklyPlan.forEach((w, idx) => {
      const label = w.label || (w.moduleIds?.length
        ? w.moduleIds.map((id) => {
            const m = curriculum.modules.find((mod) => mod.id === id);
            return m ? m.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "") : id;
          }).join(", ")
        : "Course Content");
      cumHours += curriculum.pacing.hoursPerWeek;

      const row = wsPacing.addRow([
        `Week ${w.week}`,
        label,
        curriculum.pacing.hoursPerWeek,
        cumHours,
      ]);
      styleDataRow(row, pacingHeaders.length, idx);
      row.getCell(1).font = { name: FONT_MAIN, bold: true, size: 10, color: { argb: `FF${COLORS.primary}` } };
      row.getCell(3).alignment = { horizontal: "center", vertical: "top" };
      row.getCell(4).alignment = { horizontal: "center", vertical: "top" };
    });

    wsPacing.getColumn(1).width = 12;
    wsPacing.getColumn(2).width = 45;
    wsPacing.getColumn(3).width = 10;
    wsPacing.getColumn(4).width = 16;
  }

  // ════════════════════════════════════════════════════
  //  Sheet 6: Progress Tracker
  // ════════════════════════════════════════════════════
  const wsTracker = wb.addWorksheet("Progress Tracker", {
    properties: { tabColor: { argb: `FF${COLORS.emerald}` } },
  });

  addTitle(wsTracker, "Progress Tracker", 5);

  const trackerHeaders = ["Module", "Lesson", "Format", "Duration", "Completed"];
  const trackerHeaderRow = wsTracker.addRow(trackerHeaders);
  styleHeaderRow(trackerHeaderRow, trackerHeaders.length);

  let tIdx = 0;
  curriculum.modules.forEach((mod) => {
    mod.lessons.forEach((lesson) => {
      const row = wsTracker.addRow([
        mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, ""),
        lesson.title,
        lesson.format,
        `${lesson.durationMinutes} min`,
        "",
      ]);
      styleDataRow(row, trackerHeaders.length, tIdx);
      // Make the "Completed" column a dropdown-ready empty cell
      row.getCell(5).alignment = { horizontal: "center" };
      tIdx++;
    });
  });

  wsTracker.getColumn(1).width = 25;
  wsTracker.getColumn(2).width = 35;
  wsTracker.getColumn(3).width = 12;
  wsTracker.getColumn(4).width = 12;
  wsTracker.getColumn(5).width = 12;

  // ── Generate blob ─────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
