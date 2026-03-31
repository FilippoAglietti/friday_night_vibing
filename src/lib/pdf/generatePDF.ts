/**
 * lib/pdf/generatePDF.ts
 * ─────────────────────────────────────────────────────────────
 * PREMIUM PDF export for Syllabi — stunning, magazine-quality
 * curriculum documents that justify the product's price tag.
 *
 * Design philosophy:
 *   • Generous white-space & breathing room
 *   • Violet/indigo brand palette with subtle gradients
 *   • Typographic hierarchy with consistent spacing rhythm
 *   • Module accent strips & icon-style bullets
 *   • Course stats dashboard on cover
 *   • Progress checklist for learners
 *   • Clean table of contents with dot leaders
 *
 * Uses jsPDF (client-side). No external fonts needed.
 * ─────────────────────────────────────────────────────────────
 */

import jsPDF from "jspdf";
import type {
  Curriculum,
  Module,
  Lesson,
  QuizQuestion,
  BonusResource,
} from "@/types/curriculum";

// ─── Constants ────────────────────────────────────────────────

const PAGE = {
  width: 210,
  height: 297,
  ml: 22, // margin left
  mr: 22, // margin right
  mt: 24, // margin top
  mb: 22, // margin bottom
  get cw() {
    return this.width - this.ml - this.mr;
  }, // content width
  get ch() {
    return this.height - this.mt - this.mb;
  }, // content height
} as const;

/** Brand palette — violet-forward with warm neutrals */
const C = {
  // Primary brand
  violet: [109, 40, 217] as RGB, // violet-600
  violetLight: [139, 92, 246] as RGB, // violet-500
  violetDark: [76, 29, 149] as RGB, // violet-900
  violetBg: [245, 243, 255] as RGB, // violet-50
  violetBg2: [237, 233, 254] as RGB, // violet-100
  violetMid: [196, 181, 253] as RGB, // violet-300

  // Accents
  amber: [245, 158, 11] as RGB,
  emerald: [16, 185, 129] as RGB,
  rose: [244, 63, 94] as RGB,
  sky: [14, 165, 233] as RGB,

  // Neutrals
  text: [15, 23, 42] as RGB, // slate-900
  textSec: [71, 85, 105] as RGB, // slate-500
  textMuted: [148, 163, 184] as RGB, // slate-400
  white: [255, 255, 255] as RGB,
  offWhite: [248, 250, 252] as RGB, // slate-50
  gray50: [248, 250, 252] as RGB,
  gray100: [241, 245, 249] as RGB, // slate-100
  gray200: [226, 232, 240] as RGB, // slate-200
  gray300: [203, 213, 225] as RGB, // slate-300
} as const;

type RGB = [number, number, number];

/** Font sizes in points */
const F = {
  hero: 32,
  h1: 24,
  h2: 18,
  h3: 14,
  h4: 11,
  body: 10,
  small: 9,
  xs: 8,
  xxs: 7,
} as const;

/** Spacing rhythm in mm */
const S = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 10,
  xl: 16,
  xxl: 24,
} as const;

// ─── PDFBuilder ───────────────────────────────────────────────

class PDFBuilder {
  private doc: jsPDF;
  private y: number;
  private pageNum: number;
  private toc: Array<{ title: string; page: number; level: number }>;
  private totalPages: number;

  constructor() {
    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.y = PAGE.mt;
    this.pageNum = 1;
    this.toc = [];
    this.totalPages = 0;
  }

  // ── Page Management ─────────────────────────────────────────

  private newPage(): void {
    this.doc.addPage();
    this.pageNum++;
    this.y = PAGE.mt;
  }

  private ensureSpace(needed: number): void {
    if (this.y + needed > PAGE.height - PAGE.mb) {
      this.newPage();
      this.drawFooter();
    }
  }

  // ── Low-level Helpers ───────────────────────────────────────

  private setFill(c: RGB) {
    this.doc.setFillColor(c[0], c[1], c[2]);
  }
  private setColor(c: RGB) {
    this.doc.setTextColor(c[0], c[1], c[2]);
  }
  private setDraw(c: RGB) {
    this.doc.setDrawColor(c[0], c[1], c[2]);
  }
  private lh(fontSize: number) {
    return fontSize * 0.42;
  }

  private font(
    size: number,
    weight: "normal" | "bold" | "italic" = "normal",
    color: RGB = C.text
  ) {
    this.doc.setFontSize(size);
    this.doc.setFont("helvetica", weight);
    this.setColor(color);
  }

  /** Write a single line and advance cursor */
  private text(
    str: string,
    size: number,
    weight: "normal" | "bold" | "italic" = "normal",
    color: RGB = C.text,
    x: number = PAGE.ml
  ): void {
    this.font(size, weight, color);
    this.doc.text(str, x, this.y);
    this.y += this.lh(size);
  }

  /** Write wrapped text and advance cursor */
  private wrap(
    str: string,
    size: number,
    weight: "normal" | "bold" | "italic" = "normal",
    color: RGB = C.text,
    x: number = PAGE.ml,
    maxW: number = PAGE.cw
  ): void {
    this.font(size, weight, color);
    const lines = this.doc.splitTextToSize(str, maxW) as string[];
    const lineH = this.lh(size);
    this.ensureSpace(lines.length * lineH + 2);
    for (const line of lines) {
      this.doc.text(line, x, this.y);
      this.y += lineH;
    }
  }

  /** Center text on page */
  private centerText(
    str: string,
    size: number,
    weight: "normal" | "bold" | "italic" = "normal",
    color: RGB = C.white
  ): void {
    this.font(size, weight, color);
    const lines = this.doc.splitTextToSize(str, PAGE.cw - 10) as string[];
    const lineH = this.lh(size);
    for (const line of lines) {
      this.doc.text(line, PAGE.width / 2, this.y, { align: "center" });
      this.y += lineH;
    }
  }

  private gap(mm: number = S.md) {
    this.y += mm;
  }

  /** Draw horizontal rule */
  private hr(color: RGB = C.gray200, thickness = 0.3) {
    this.setDraw(color);
    this.doc.setLineWidth(thickness);
    this.doc.line(PAGE.ml, this.y, PAGE.width - PAGE.mr, this.y);
    this.y += S.sm;
  }

  /** Draw rounded rectangle */
  private roundedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: RGB,
    stroke?: RGB
  ) {
    this.setFill(fill);
    if (stroke) {
      this.setDraw(stroke);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(x, y, w, h, r, r, "FD");
    } else {
      this.doc.roundedRect(x, y, w, h, r, r, "F");
    }
  }

  /** Draw a small pill badge */
  private badge(
    text: string,
    x: number,
    y: number,
    bgColor: RGB,
    textColor: RGB = C.white
  ) {
    this.font(F.xxs, "bold", textColor);
    const tw = this.doc.getTextWidth(text) + 5;
    this.roundedRect(x, y - 3, tw, 5, 2, bgColor);
    this.doc.text(text, x + 2.5, y);
  }

  // ── Footer ──────────────────────────────────────────────────

  private drawFooter(): void {
    const fy = PAGE.height - 12;
    // Subtle top line
    this.setDraw(C.gray200);
    this.doc.setLineWidth(0.2);
    this.doc.line(PAGE.ml, fy - 3, PAGE.width - PAGE.mr, fy - 3);

    this.font(F.xxs, "normal", C.textMuted);
    this.doc.text("Generated by Syllabi", PAGE.ml, fy);
    this.doc.text(`${this.pageNum}`, PAGE.width - PAGE.mr, fy, {
      align: "right",
    });

    // Small violet accent dot
    this.setFill(C.violet);
    this.doc.circle(PAGE.width / 2, fy - 0.5, 0.6, "F");
  }

  // ═══════════════════════════════════════════════════════════
  //  COVER PAGE — Premium magazine-style
  // ═══════════════════════════════════════════════════════════

  buildCover(c: Curriculum): void {
    // ── Full-bleed violet gradient (simulated with bands)
    const steps = 40;
    const bandH = PAGE.height / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.round(C.violetDark[0] + (C.violet[0] - C.violetDark[0]) * t);
      const g = Math.round(C.violetDark[1] + (C.violet[1] - C.violetDark[1]) * t);
      const b = Math.round(C.violetDark[2] + (C.violet[2] - C.violetDark[2]) * t);
      this.setFill([r, g, b] as RGB);
      this.doc.rect(0, i * bandH, PAGE.width, bandH + 0.5, "F");
    }

    // ── Decorative geometric shapes (subtle)
    this.doc.setGState(new (this.doc as any).GState({ opacity: 0.06 }));
    this.setFill(C.white);
    this.doc.circle(170, 40, 45, "F");
    this.doc.circle(30, 250, 35, "F");
    this.doc.rect(150, 220, 60, 60, "F");
    this.doc.setGState(new (this.doc as any).GState({ opacity: 1 }));

    // ── "SYLLABI" brand mark top-left
    this.y = 28;
    this.font(F.xs, "bold", C.violetMid);
    this.doc.text("S Y L L A B I", PAGE.ml, this.y);

    // ── Difficulty badge top-right
    const diffColors: Record<string, RGB> = {
      beginner: C.emerald,
      intermediate: C.amber,
      advanced: C.rose,
    };
    const diffColor = diffColors[c.difficulty] || C.violet;
    this.badge(
      c.difficulty.toUpperCase(),
      PAGE.width - PAGE.mr - 25,
      this.y,
      diffColor
    );

    // ── Title (large, bold, white)
    this.y = 75;
    this.font(F.hero, "bold", C.white);
    const titleLines = this.doc.splitTextToSize(
      c.title,
      PAGE.cw
    ) as string[];
    for (const line of titleLines) {
      this.doc.text(line, PAGE.ml, this.y);
      this.y += F.hero * 0.45;
    }
    this.gap(S.md);

    // ── Subtitle
    this.font(F.h3, "normal", C.violetMid);
    const subLines = this.doc.splitTextToSize(c.subtitle, PAGE.cw) as string[];
    for (const line of subLines) {
      this.doc.text(line, PAGE.ml, this.y);
      this.y += F.h3 * 0.42;
    }
    this.gap(S.xl);

    // ── Accent line
    this.setFill(C.violetMid);
    this.doc.rect(PAGE.ml, this.y, 40, 0.8, "F");
    this.gap(S.xl);

    // ── Description
    this.font(F.body, "normal", [224, 231, 255] as RGB);
    const descLines = this.doc.splitTextToSize(
      c.description,
      PAGE.cw - 10
    ) as string[];
    for (const line of descLines) {
      this.doc.text(line, PAGE.ml, this.y);
      this.y += F.body * 0.45;
    }
    this.gap(S.xxl);

    // ── Stats dashboard — 4 cards in a row
    const totalLessons = c.modules.reduce(
      (a, m) => a + (m.lessons?.length || 0),
      0
    );
    const totalQuizzes = c.modules.reduce(
      (a, m) => a + (m.quiz?.length || 0) + m.lessons.reduce((b, l) => b + (l.quiz?.length || 0), 0),
      0
    );
    const stats = [
      { label: "Modules", value: `${c.modules.length}` },
      { label: "Lessons", value: `${totalLessons}` },
      { label: "Hours", value: `${c.pacing.totalHours}` },
      { label: "Quizzes", value: `${totalQuizzes}` },
    ];

    const cardW = (PAGE.cw - 12) / 4;
    const cardH = 22;
    const cardY = Math.min(this.y, PAGE.height - PAGE.mb - cardH - 30);

    stats.forEach((s, i) => {
      const cx = PAGE.ml + i * (cardW + 4);
      // Card background with transparency effect
      this.doc.setGState(new (this.doc as any).GState({ opacity: 0.12 }));
      this.roundedRect(cx, cardY, cardW, cardH, 3, C.white);
      this.doc.setGState(new (this.doc as any).GState({ opacity: 1 }));

      // Draw border
      this.setDraw(C.violetMid);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(cx, cardY, cardW, cardH, 3, 3);

      // Value
      this.font(F.h2, "bold", C.white);
      this.doc.text(s.value, cx + cardW / 2, cardY + 10, { align: "center" });

      // Label
      this.font(F.xs, "normal", C.violetMid);
      this.doc.text(s.label, cx + cardW / 2, cardY + 17, { align: "center" });
    });

    // ── Footer on cover
    this.font(F.xxs, "normal", C.violetMid);
    this.doc.text(
      "syllabi.online",
      PAGE.width / 2,
      PAGE.height - 12,
      { align: "center" }
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  COURSE OVERVIEW PAGE — What You'll Learn + Prerequisites
  // ═══════════════════════════════════════════════════════════

  buildOverviewPage(c: Curriculum): void {
    this.newPage();
    this.drawFooter();

    // Section header
    this.sectionHeader("Course Overview");
    this.gap(S.md);

    // Target audience callout box
    this.roundedRect(
      PAGE.ml,
      this.y - 2,
      PAGE.cw,
      14,
      3,
      C.violetBg,
      C.violetBg2
    );
    this.font(F.xs, "bold", C.violet);
    this.doc.text("TARGET AUDIENCE", PAGE.ml + 5, this.y + 3);
    this.font(F.small, "normal", C.text);
    this.doc.text(c.targetAudience, PAGE.ml + 5, this.y + 8);
    this.y += 18;
    this.gap(S.lg);

    // Learning Objectives
    this.text("What You'll Learn", F.h3, "bold", C.violet);
    this.gap(S.sm);

    c.objectives.forEach((obj, i) => {
      this.ensureSpace(12);
      // Numbered circle
      const cx = PAGE.ml + 4;
      this.setFill(C.violet);
      this.doc.circle(cx, this.y - 1.2, 3, "F");
      this.font(F.xs, "bold", C.white);
      this.doc.text(`${i + 1}`, cx, this.y - 0.5, { align: "center" });

      // Objective text
      this.font(F.body, "normal", C.text);
      const lines = this.doc.splitTextToSize(obj, PAGE.cw - 16) as string[];
      for (const line of lines) {
        this.doc.text(line, PAGE.ml + 12, this.y);
        this.y += this.lh(F.body);
      }
      this.gap(S.sm);
    });

    // Prerequisites
    if (c.prerequisites && c.prerequisites.length > 0) {
      this.gap(S.lg);
      this.text("Prerequisites", F.h3, "bold", C.violet);
      this.gap(S.sm);

      c.prerequisites.forEach((p) => {
        this.ensureSpace(8);
        this.font(F.body, "normal", C.textSec);
        this.doc.text("\u2022", PAGE.ml + 4, this.y);
        const lines = this.doc.splitTextToSize(p, PAGE.cw - 14) as string[];
        for (const line of lines) {
          this.doc.text(line, PAGE.ml + 10, this.y);
          this.y += this.lh(F.body);
        }
        this.gap(S.xs);
      });
    }

    // Pacing overview box
    this.gap(S.xl);
    this.ensureSpace(30);
    this.roundedRect(
      PAGE.ml,
      this.y,
      PAGE.cw,
      24,
      3,
      C.gray50,
      C.gray200
    );

    const colW = PAGE.cw / 4;
    const boxY = this.y;
    const pacingData = [
      { label: "Style", value: c.pacing.style.replace("-", " ") },
      { label: "Duration", value: `${c.pacing.totalWeeks} weeks` },
      { label: "Hours/Week", value: `${c.pacing.hoursPerWeek}h` },
      { label: "Total Hours", value: `${c.pacing.totalHours}h` },
    ];

    pacingData.forEach((p, i) => {
      const px = PAGE.ml + i * colW + colW / 2;
      this.font(F.xxs, "bold", C.textMuted);
      this.doc.text(p.label.toUpperCase(), px, boxY + 8, { align: "center" });
      this.font(F.h4, "bold", C.text);
      this.doc.text(p.value, px, boxY + 16, { align: "center" });
    });

    this.y = boxY + 28;
  }

  // ═══════════════════════════════════════════════════════════
  //  TABLE OF CONTENTS
  // ═══════════════════════════════════════════════════════════

  buildTOC(): void {
    this.newPage();
    this.drawFooter();

    this.sectionHeader("Table of Contents");
    this.gap(S.lg);

    for (const entry of this.toc) {
      this.ensureSpace(10);

      const indent = entry.level === 1 ? 0 : 8;
      const fontSize = entry.level === 1 ? F.body : F.small;
      const weight = entry.level === 1 ? "bold" : "normal";
      const color = entry.level === 1 ? C.text : C.textSec;

      this.font(fontSize, weight as "normal" | "bold", color);
      const titleStr = entry.title;
      this.doc.text(titleStr, PAGE.ml + indent, this.y);

      // Page number
      this.font(fontSize, "normal", C.textMuted);
      this.doc.text(`${entry.page}`, PAGE.width - PAGE.mr, this.y, {
        align: "right",
      });

      // Dot leader
      const titleW = this.doc.getTextWidth(titleStr) + indent + 3;
      const pageW = this.doc.getTextWidth(`${entry.page}`) + 3;
      this.setDraw(C.gray300);
      this.doc.setLineDashPattern([0.5, 2], 0);
      this.doc.setLineWidth(0.2);
      this.doc.line(
        PAGE.ml + titleW,
        this.y - 0.8,
        PAGE.width - PAGE.mr - pageW,
        this.y - 0.8
      );
      this.doc.setLineDashPattern([], 0);

      this.y += entry.level === 1 ? 8 : 6;
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  MODULE SECTION — Premium layout
  // ═══════════════════════════════════════════════════════════

  buildModule(mod: Module, curriculum: Curriculum): void {
    this.newPage();
    this.drawFooter();

    const cleanTitle = mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "");
    const modNum = mod.order + 1;
    const heading = `Module ${modNum}: ${cleanTitle}`;

    // Register in TOC
    this.toc.push({ title: heading, page: this.pageNum, level: 1 });

    // ── Module header block
    // Violet accent strip on left
    this.setFill(C.violet);
    this.doc.rect(PAGE.ml, this.y - 4, 3, 20, "F");

    // Module number circle
    const circleX = PAGE.ml + 14;
    const circleY = this.y + 3;
    this.setFill(C.violet);
    this.doc.circle(circleX, circleY, 6, "F");
    this.font(F.h3, "bold", C.white);
    this.doc.text(`${modNum}`, circleX, circleY + 1.5, { align: "center" });

    // Module title
    this.font(F.h2, "bold", C.text);
    const titleLines = this.doc.splitTextToSize(cleanTitle, PAGE.cw - 30) as string[];
    let ty = this.y - 1;
    for (const line of titleLines) {
      this.doc.text(line, PAGE.ml + 24, ty);
      ty += this.lh(F.h2);
    }
    this.y = ty + S.sm;

    // Duration badge
    const totalMin = mod.durationMinutes || mod.lessons.reduce((a, l) => a + l.durationMinutes, 0);
    const hours = Math.round(totalMin / 60 * 10) / 10;
    this.badge(`${hours}h`, PAGE.ml + 24, this.y, C.violetLight);
    this.badge(
      `${mod.lessons.length} LESSONS`,
      PAGE.ml + 24 + this.doc.getTextWidth(`${hours}h`) + 12,
      this.y,
      C.gray300,
      C.text
    );
    this.y += S.md;

    // Module description
    this.gap(S.sm);
    this.wrap(mod.description, F.body, "normal", C.textSec, PAGE.ml + 4);
    this.gap(S.md);

    // Module objectives in a subtle card
    if (mod.objectives && mod.objectives.length > 0) {
      this.ensureSpace(20);
      const objStartY = this.y;
      this.roundedRect(PAGE.ml, this.y, PAGE.cw, 8, 2, C.violetBg);
      this.font(F.xs, "bold", C.violet);
      this.doc.text("MODULE OBJECTIVES", PAGE.ml + 5, this.y + 5);
      this.y += 10;

      mod.objectives.forEach((o) => {
        this.ensureSpace(8);
        this.font(F.small, "normal", C.text);
        this.doc.text("\u2713", PAGE.ml + 5, this.y);
        const lines = this.doc.splitTextToSize(o, PAGE.cw - 18) as string[];
        for (const line of lines) {
          this.doc.text(line, PAGE.ml + 12, this.y);
          this.y += this.lh(F.small);
        }
        this.gap(S.xs);
      });
      this.gap(S.sm);
    }

    // ── Lessons
    this.gap(S.md);
    this.hr(C.gray200);

    for (const lesson of mod.lessons) {
      this.buildLesson(lesson, modNum);
    }

    // ── Module Quiz
    if (mod.quiz && mod.quiz.length > 0) {
      this.gap(S.lg);
      this.ensureSpace(20);

      this.toc.push({
        title: `  Module ${modNum} Quiz`,
        page: this.pageNum,
        level: 2,
      });

      // Quiz header
      this.roundedRect(PAGE.ml, this.y - 2, PAGE.cw, 10, 2, C.violetBg);
      this.font(F.h4, "bold", C.violet);
      this.doc.text(
        `Knowledge Check — Module ${modNum}`,
        PAGE.ml + 5,
        this.y + 4
      );
      this.y += 14;

      for (let i = 0; i < mod.quiz.length; i++) {
        this.buildQuiz(mod.quiz[i], i + 1);
      }
    }
  }

  // ── Lesson Block ────────────────────────────────────────────

  private buildLesson(lesson: Lesson, modNum: number): void {
    this.ensureSpace(28);

    // Lesson number + title row
    const lessonNum = lesson.order + 1;
    this.font(F.h4, "bold", C.text);
    this.doc.text(`${lessonNum}.`, PAGE.ml + 2, this.y);
    this.doc.text(lesson.title, PAGE.ml + 10, this.y);

    // Right-aligned metadata badges
    const formatLabel = lesson.format?.toUpperCase() || "READING";
    const durLabel = `${lesson.durationMinutes} MIN`;

    // Duration
    this.font(F.xxs, "normal", C.textMuted);
    const durW = this.doc.getTextWidth(durLabel) + 5;
    this.roundedRect(
      PAGE.width - PAGE.mr - durW,
      this.y - 3,
      durW,
      5,
      2,
      C.gray100
    );
    this.font(F.xxs, "bold", C.textSec);
    this.doc.text(
      durLabel,
      PAGE.width - PAGE.mr - durW + 2.5,
      this.y
    );

    // Format badge
    const formatW = this.doc.getTextWidth(formatLabel) + 5;
    const formatColors: Record<string, RGB> = {
      VIDEO: C.rose,
      READING: C.sky,
      INTERACTIVE: C.emerald,
      DISCUSSION: C.amber,
      PROJECT: C.violet,
      "LIVE-SESSION": C.violetLight,
    };
    const fColor = formatColors[formatLabel] || C.textMuted;
    this.roundedRect(
      PAGE.width - PAGE.mr - durW - formatW - 3,
      this.y - 3,
      formatW,
      5,
      2,
      fColor
    );
    this.font(F.xxs, "bold", C.white);
    this.doc.text(
      formatLabel,
      PAGE.width - PAGE.mr - durW - formatW - 3 + 2.5,
      this.y
    );

    this.y += this.lh(F.h4) + 1;

    // Lesson objectives
    if (lesson.objectives && lesson.objectives.length > 0) {
      lesson.objectives.slice(0, 2).forEach((o) => {
        this.font(F.small, "normal", C.textSec);
        this.doc.text("\u2022", PAGE.ml + 10, this.y);
        const lines = this.doc.splitTextToSize(o, PAGE.cw - 22) as string[];
        for (const line of lines) {
          this.doc.text(line, PAGE.ml + 15, this.y);
          this.y += this.lh(F.small);
        }
      });
    }

    // Key points
    if (lesson.keyPoints && lesson.keyPoints.length > 0) {
      this.gap(S.xs);
      lesson.keyPoints.slice(0, 3).forEach((kp) => {
        this.ensureSpace(8);
        this.font(F.small, "italic", C.textMuted);
        this.doc.text("\u25B8", PAGE.ml + 10, this.y);
        const lines = this.doc.splitTextToSize(kp, PAGE.cw - 22) as string[];
        for (const line of lines) {
          this.doc.text(line, PAGE.ml + 15, this.y);
          this.y += this.lh(F.small);
        }
      });
    }

    this.gap(S.sm);

    // Subtle separator between lessons
    this.setDraw(C.gray100);
    this.doc.setLineWidth(0.15);
    this.doc.line(PAGE.ml + 10, this.y, PAGE.width - PAGE.mr, this.y);
    this.gap(S.sm);
  }

  // ── Quiz Question ───────────────────────────────────────────

  private buildQuiz(q: QuizQuestion, num: number): void {
    this.ensureSpace(32);

    // Question
    this.font(F.body, "bold", C.text);
    const qText = `${num}. ${q.question}`;
    const qLines = this.doc.splitTextToSize(qText, PAGE.cw - 8) as string[];
    for (const line of qLines) {
      this.doc.text(line, PAGE.ml + 4, this.y);
      this.y += this.lh(F.body);
    }
    this.gap(S.xs);

    // Options
    const letters = ["A", "B", "C", "D"];
    if (q.options) {
      q.options.forEach((opt, i) => {
        this.ensureSpace(8);
        const isCorrect =
          opt === q.correctAnswer || i === q.correctAnswer;
        const bg = isCorrect ? C.emerald : C.gray100;
        const tc = isCorrect ? C.white : C.textSec;
        const textC = isCorrect ? C.text : C.textSec;

        // Letter circle
        this.setFill(bg);
        this.doc.circle(PAGE.ml + 10, this.y - 1, 2.5, "F");
        this.font(F.xxs, "bold", tc);
        this.doc.text(letters[i], PAGE.ml + 10, this.y, { align: "center" });

        // Option text
        this.font(F.small, isCorrect ? "bold" : "normal", textC);
        const optLines = this.doc.splitTextToSize(opt, PAGE.cw - 24) as string[];
        for (const line of optLines) {
          this.doc.text(line, PAGE.ml + 16, this.y);
          this.y += this.lh(F.small);
        }
        this.gap(S.xs);
      });
    }

    // Explanation
    if (q.explanation) {
      this.gap(S.xs);
      this.roundedRect(
        PAGE.ml + 4,
        this.y - 2,
        PAGE.cw - 8,
        4 + this.doc.splitTextToSize(q.explanation, PAGE.cw - 20).length * this.lh(F.xs) + 2,
        2,
        C.gray50
      );
      this.font(F.xs, "italic", C.textSec);
      const expLines = this.doc.splitTextToSize(
        q.explanation,
        PAGE.cw - 20
      ) as string[];
      this.y += 1;
      for (const line of expLines) {
        this.doc.text(line, PAGE.ml + 8, this.y);
        this.y += this.lh(F.xs);
      }
      this.y += 2;
    }
    this.gap(S.md);
  }

  // ═══════════════════════════════════════════════════════════
  //  PACING SCHEDULE
  // ═══════════════════════════════════════════════════════════

  buildPacing(c: Curriculum): void {
    this.newPage();
    this.drawFooter();
    this.toc.push({ title: "Pacing Schedule", page: this.pageNum, level: 1 });

    this.sectionHeader("Pacing Schedule");
    this.gap(S.md);

    // Summary bar
    this.roundedRect(PAGE.ml, this.y, PAGE.cw, 12, 3, C.violetBg);
    this.font(F.small, "bold", C.violet);
    this.doc.text(
      `${c.pacing.style.replace("-", " ").toUpperCase()}  \u2022  ${c.pacing.totalWeeks} Weeks  \u2022  ${c.pacing.hoursPerWeek}h/week  \u2022  ${c.pacing.totalHours}h Total`,
      PAGE.ml + 5,
      this.y + 7
    );
    this.y += 18;

    // Weekly breakdown table
    if (c.pacing.weeklyPlan && c.pacing.weeklyPlan.length > 0) {
      // Header
      const colWidths = [25, PAGE.cw - 55, 30]; // week, content, hours
      this.roundedRect(PAGE.ml, this.y - 2, PAGE.cw, 8, 2, C.violet);
      this.font(F.xs, "bold", C.white);
      this.doc.text("WEEK", PAGE.ml + 4, this.y + 3);
      this.doc.text("FOCUS", PAGE.ml + colWidths[0] + 4, this.y + 3);
      this.doc.text("HOURS", PAGE.ml + colWidths[0] + colWidths[1] + 4, this.y + 3);
      this.y += 10;

      c.pacing.weeklyPlan.forEach((w, idx) => {
        this.ensureSpace(10);
        const isEven = idx % 2 === 0;
        if (isEven) {
          this.setFill(C.gray50);
          this.doc.rect(PAGE.ml, this.y - 3, PAGE.cw, 8, "F");
        }

        const label =
          w.label ||
          (w.moduleIds?.length
            ? w.moduleIds
                .map((id) => {
                  const m = c.modules.find((mod) => mod.id === id);
                  return m
                    ? m.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "")
                    : id;
                })
                .join(", ")
            : "Course Content");

        this.font(F.small, "bold", C.violet);
        this.doc.text(`${w.week}`, PAGE.ml + 4, this.y + 1);

        this.font(F.small, "normal", C.text);
        const labelLines = this.doc.splitTextToSize(label, colWidths[1] - 4) as string[];
        this.doc.text(labelLines[0], PAGE.ml + colWidths[0] + 4, this.y + 1);

        this.font(F.small, "normal", C.textSec);
        this.doc.text(
          `${c.pacing.hoursPerWeek}h`,
          PAGE.ml + colWidths[0] + colWidths[1] + 4,
          this.y + 1
        );

        this.y += 8;
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  BONUS RESOURCES
  // ═══════════════════════════════════════════════════════════

  buildResources(resources: BonusResource[]): void {
    this.newPage();
    this.drawFooter();
    this.toc.push({
      title: "Bonus Resources",
      page: this.pageNum,
      level: 1,
    });

    this.sectionHeader("Bonus Resources");
    this.gap(S.lg);

    const typeColors: Record<string, RGB> = {
      article: C.sky,
      video: C.rose,
      podcast: C.amber,
      book: C.violet,
      tool: C.emerald,
      template: C.violetLight,
      cheatsheet: C.violetDark,
    };

    resources.forEach((r) => {
      this.ensureSpace(18);

      // Type badge
      const tc = typeColors[r.type] || C.textMuted;
      this.badge(r.type.toUpperCase(), PAGE.ml, this.y, tc);

      // Title
      const badgeW = this.doc.getTextWidth(r.type.toUpperCase()) + 9;
      this.font(F.body, "bold", C.text);
      this.doc.text(r.title, PAGE.ml + badgeW, this.y);
      this.y += this.lh(F.body) + 1;

      // Description
      if (r.description) {
        this.wrap(r.description, F.small, "normal", C.textSec, PAGE.ml + 4, PAGE.cw - 8);
      }

      // URL
      if (r.url) {
        this.font(F.xs, "normal", C.violetLight);
        this.doc.text(r.url, PAGE.ml + 4, this.y);
        this.y += this.lh(F.xs);
      }

      this.gap(S.md);
      this.hr(C.gray100, 0.15);
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  LEARNING CHECKLIST — Printable progress tracker
  // ═══════════════════════════════════════════════════════════

  buildChecklist(c: Curriculum): void {
    this.newPage();
    this.drawFooter();
    this.toc.push({
      title: "Learning Checklist",
      page: this.pageNum,
      level: 1,
    });

    this.sectionHeader("Learning Checklist");
    this.gap(S.sm);
    this.wrap(
      "Track your progress as you work through the course. Check off each lesson as you complete it.",
      F.small,
      "italic",
      C.textMuted
    );
    this.gap(S.lg);

    c.modules.forEach((mod) => {
      this.ensureSpace(14);
      const cleanTitle = mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "");
      this.font(F.h4, "bold", C.violet);
      this.doc.text(`Module ${mod.order + 1}: ${cleanTitle}`, PAGE.ml, this.y);
      this.y += this.lh(F.h4) + 2;

      mod.lessons.forEach((l) => {
        this.ensureSpace(8);

        // Checkbox square
        this.setDraw(C.gray300);
        this.doc.setLineWidth(0.3);
        this.doc.rect(PAGE.ml + 4, this.y - 3, 3.5, 3.5);

        // Lesson title
        this.font(F.small, "normal", C.text);
        this.doc.text(l.title, PAGE.ml + 12, this.y);

        // Duration right-aligned
        this.font(F.xs, "normal", C.textMuted);
        this.doc.text(
          `${l.durationMinutes}m`,
          PAGE.width - PAGE.mr,
          this.y,
          { align: "right" }
        );

        this.y += 6;
      });

      this.gap(S.md);
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  CERTIFICATE PAGE — Completion certificate
  // ═══════════════════════════════════════════════════════════

  buildCertificate(c: Curriculum): void {
    this.newPage();
    this.toc.push({
      title: "Certificate of Completion",
      page: this.pageNum,
      level: 1,
    });

    // Elegant border
    this.setDraw(C.violet);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(12, 12, PAGE.width - 24, PAGE.height - 24, 3, 3);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(15, 15, PAGE.width - 30, PAGE.height - 30, 2, 2);

    // Decorative corners
    this.setFill(C.violetBg);
    this.doc.circle(15, 15, 8, "F");
    this.doc.circle(PAGE.width - 15, 15, 8, "F");
    this.doc.circle(15, PAGE.height - 15, 8, "F");
    this.doc.circle(PAGE.width - 15, PAGE.height - 15, 8, "F");

    // Content
    this.y = 55;
    this.centerText("S Y L L A B I", F.xs, "bold", C.violet);
    this.gap(S.xl);

    this.centerText("Certificate of Completion", F.h1, "bold", C.text);
    this.gap(S.lg);

    // Accent line
    this.setFill(C.violet);
    this.doc.rect(PAGE.width / 2 - 20, this.y, 40, 0.8, "F");
    this.gap(S.xl);

    this.centerText("This certifies that", F.body, "normal", C.textSec);
    this.gap(S.lg);

    // Name placeholder line
    this.setDraw(C.gray300);
    this.doc.setLineWidth(0.3);
    this.doc.line(55, this.y, PAGE.width - 55, this.y);
    this.gap(S.xs);
    this.centerText("Your Name", F.xs, "normal", C.textMuted);
    this.gap(S.xl);

    this.centerText("has successfully completed the course", F.body, "normal", C.textSec);
    this.gap(S.lg);

    this.centerText(c.title, F.h3, "bold", C.violet);
    this.gap(S.md);

    const totalLessons = c.modules.reduce(
      (a, m) => a + (m.lessons?.length || 0),
      0
    );
    this.centerText(
      `${c.modules.length} Modules \u2022 ${totalLessons} Lessons \u2022 ${c.pacing.totalHours} Hours`,
      F.small,
      "normal",
      C.textSec
    );
    this.gap(S.xxl);
    this.gap(S.xxl);

    // Date and signature lines
    const lineY = this.y;
    this.setDraw(C.gray300);
    this.doc.line(35, lineY, 90, lineY);
    this.doc.line(120, lineY, 175, lineY);
    this.gap(S.xs);

    this.font(F.xs, "normal", C.textMuted);
    this.doc.text("Date", 62.5, this.y, { align: "center" });
    this.doc.text("Signature", 147.5, this.y, { align: "center" });
  }

  // ── Shared Section Header ───────────────────────────────────

  private sectionHeader(title: string): void {
    // Violet accent bar
    this.setFill(C.violet);
    this.doc.rect(PAGE.ml, this.y, 3, 10, "F");

    this.font(F.h2, "bold", C.text);
    this.doc.text(title, PAGE.ml + 8, this.y + 7);
    this.y += 14;

    this.hr(C.violet, 0.5);
  }

  // ── Build ───────────────────────────────────────────────────

  getDocument(): jsPDF {
    return this.doc;
  }
}

// ─── Public API ───────────────────────────────────────────────

export function generateCurriculumPDF(curriculum: Curriculum): jsPDF {
  const builder = new PDFBuilder();

  // 1. Cover page
  builder.buildCover(curriculum);

  // 2. Course overview
  builder.buildOverviewPage(curriculum);

  // 3. Module sections
  for (const mod of curriculum.modules) {
    builder.buildModule(mod, curriculum);
  }

  // 4. Pacing schedule
  builder.buildPacing(curriculum);

  // 5. Bonus resources
  if (curriculum.bonusResources && curriculum.bonusResources.length > 0) {
    builder.buildResources(curriculum.bonusResources);
  }

  // 6. Learning checklist (printable progress tracker)
  builder.buildChecklist(curriculum);

  // 7. Certificate of completion
  builder.buildCertificate(curriculum);

  // 8. Table of contents (appended last so page numbers are correct)
  builder.buildTOC();

  return builder.getDocument();
}
