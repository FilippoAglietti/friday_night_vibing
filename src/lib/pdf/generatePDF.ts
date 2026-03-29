/**
 * lib/pdf/generatePDF.ts
 * ─────────────────────────────────────────────────────────────
 * PDF export for Syllabi.ai curriculum documents.
 *
 * Uses jsPDF (lightweight, client-side) to generate a professional
 * multi-page PDF from a Curriculum object.
 *
 * Install:  npm install jspdf
 *
 * The PDF includes:
 *   - Cover page (course title, subtitle, generated-by badge)
 *   - Table of contents
 *   - One section per module:
 *       • Module title + description
 *       • Lesson list with objectives, duration, key topics
 *       • Quiz questions with answers + explanations
 *   - Pacing schedule
 *   - Bonus resources
 *
 * Usage (in CurriculumOutput.tsx):
 *   import { generateCurriculumPDF } from '@/lib/pdf/generatePDF'
 *   const pdf = generateCurriculumPDF(curriculum)
 *   pdf.save(`${curriculum.title}.pdf`)
 * ─────────────────────────────────────────────────────────────
 */

import jsPDF from "jspdf";
import type { Curriculum, Module, Lesson, QuizQuestion, BonusResource } from "@/types/curriculum";

// ─── Constants ────────────────────────────────────────────────

/** Page dimensions and margins (in mm, A4 format) */
const PAGE = {
  width: 210,
  height: 297,
  marginLeft: 20,
  marginRight: 20,
  marginTop: 20,
  marginBottom: 25,
  contentWidth: 170, // width - marginLeft - marginRight
} as const;

/** Brand colours (RGB) */
const COLORS = {
  primary: [79, 70, 229] as [number, number, number],   // Indigo-600
  secondary: [99, 102, 241] as [number, number, number], // Indigo-500
  text: [17, 24, 39] as [number, number, number],        // Gray-900
  textMuted: [107, 114, 128] as [number, number, number],// Gray-500
  white: [255, 255, 255] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],// Gray-100
  border: [229, 231, 235] as [number, number, number],   // Gray-200
} as const;

/** Font sizes */
const FONT = {
  h1: 28,
  h2: 18,
  h3: 14,
  h4: 12,
  body: 10,
  small: 9,
  tiny: 8,
} as const;

// ─── PDFBuilder class ─────────────────────────────────────────

/**
 * PDFBuilder wraps jsPDF and provides higher-level helpers for
 * writing text, drawing shapes, and managing pagination.
 *
 * All coordinates are in millimetres (mm), origin top-left.
 */
class PDFBuilder {
  /** The underlying jsPDF instance */
  private doc: jsPDF;

  /** Current Y cursor position (mm from top of page) */
  private y: number;

  /** Current page number (1-based) */
  private pageNum: number;

  /** Table of contents entries: [moduleTitle, pageNumber] */
  private toc: Array<{ title: string; page: number }>;

  constructor() {
    // Create an A4 portrait PDF with UTF-8 support
    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.y = PAGE.marginTop;
    this.pageNum = 1;
    this.toc = [];
  }

  // ── Page management ──────────────────────────────────────────

  /**
   * Adds a new page and resets the Y cursor.
   * Also draws the page header and footer on every new page.
   */
  private newPage(): void {
    this.doc.addPage();
    this.pageNum++;
    this.y = PAGE.marginTop;
    this.drawPageFooter();
  }

  /**
   * Ensures there is enough vertical space remaining on the current page.
   * If not, starts a new page.
   *
   * @param neededMm - Minimum mm of vertical space needed
   */
  private ensureSpace(neededMm: number): void {
    if (this.y + neededMm > PAGE.height - PAGE.marginBottom) {
      this.newPage();
    }
  }

  // ── Drawing helpers ──────────────────────────────────────────

  /** Sets the fill colour using an RGB tuple */
  private fill(color: [number, number, number]): void {
    this.doc.setFillColor(color[0], color[1], color[2]);
  }

  /** Sets the text/draw colour using an RGB tuple */
  private color(color: [number, number, number]): void {
    this.doc.setTextColor(color[0], color[1], color[2]);
  }

  /** Draws a horizontal rule across the content width */
  private hr(yOffset = 2): void {
    this.y += yOffset;
    this.doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    this.doc.line(PAGE.marginLeft, this.y, PAGE.width - PAGE.marginRight, this.y);
    this.y += yOffset;
  }

  /**
   * Writes a single line of text and advances the cursor.
   *
   * @param text    - Text string to write
   * @param fontSize  - Font size in pt
   * @param bold    - Whether to use bold font weight
   * @param color   - RGB text color
   * @param x       - X position (defaults to left margin)
   */
  private text(
    text: string,
    fontSize: number,
    bold = false,
    color: [number, number, number] = COLORS.text,
    x: number = PAGE.marginLeft
  ): void {
    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.color(color);
    this.doc.text(text, x, this.y);
    // Advance cursor by approximate line height (fontSize pt → mm ≈ fontSize * 0.35)
    this.y += fontSize * 0.42;
  }

  /**
   * Writes wrapped multi-line text within the content width and advances cursor.
   *
   * @param text      - Text string (may be long)
   * @param fontSize  - Font size in pt
   * @param bold      - Bold weight
   * @param color     - RGB text color
   * @param x         - X starting position
   * @param maxWidth  - Max width in mm before wrapping
   */
  private wrappedText(
    text: string,
    fontSize: number,
    bold = false,
    color: [number, number, number] = COLORS.text,
    x: number = PAGE.marginLeft,
    maxWidth: number = PAGE.contentWidth
  ): void {
    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.color(color);

    const lines = this.doc.splitTextToSize(text, maxWidth) as string[];
    const lineHeight = fontSize * 0.42;

    // Check if all lines fit on the current page, or start a new one
    this.ensureSpace(lines.length * lineHeight + 2);

    for (const line of lines) {
      this.doc.text(line, x, this.y);
      this.y += lineHeight;
    }
  }

  /** Advances the cursor by a fixed gap (default 4mm) */
  private gap(mm = 4): void {
    this.y += mm;
  }

  // ── Footer ───────────────────────────────────────────────────

  /**
   * Draws the Syllabi.ai footer on the current page.
   * Called automatically when a new page is created.
   */
  private drawPageFooter(): void {
    const footerY = PAGE.height - 10;
    this.doc.setFontSize(FONT.tiny);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
    this.doc.text("Generated by Syllabi.ai", PAGE.marginLeft, footerY);
    this.doc.text(
      `Page ${this.pageNum}`,
      PAGE.width - PAGE.marginRight,
      footerY,
      { align: "right" }
    );
  }

  // ── Section builders ─────────────────────────────────────────

  /**
   * Builds the cover page with branding, title and course metadata.
   *
   * @param curriculum - The curriculum to build the cover for
   */
  buildCoverPage(curriculum: Curriculum): void {
    // Full-bleed indigo background
    this.fill(COLORS.primary);
    this.doc.rect(0, 0, PAGE.width, PAGE.height, "F");

    // "Generated by Syllabi.ai" badge at top-right
    this.doc.setFontSize(FONT.small);
    this.doc.setFont("helvetica", "italic");
    this.doc.setTextColor(255, 255, 255, 0.7);
    this.doc.text("Generated by Syllabi.ai", PAGE.width - PAGE.marginRight, 15, { align: "right" });

    // Course title — large, centred
    this.y = 70;
    this.doc.setFontSize(FONT.h1);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(255, 255, 255);
    const titleLines = this.doc.splitTextToSize(curriculum.title, PAGE.contentWidth) as string[];
    this.doc.text(titleLines, PAGE.width / 2, this.y, { align: "center" });
    this.y += titleLines.length * FONT.h1 * 0.45 + 4;

    // Subtitle
    this.doc.setFontSize(FONT.h3);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(199, 210, 254); // indigo-200
    const subLines = this.doc.splitTextToSize(curriculum.subtitle, PAGE.contentWidth) as string[];
    this.doc.text(subLines, PAGE.width / 2, this.y, { align: "center" });
    this.y += subLines.length * FONT.h3 * 0.45 + 16;

    // Divider line
    this.doc.setDrawColor(255, 255, 255, 0.3);
    this.doc.line(PAGE.marginLeft + 20, this.y, PAGE.width - PAGE.marginRight - 20, this.y);
    this.y += 12;

    // Course description
    this.doc.setFontSize(FONT.body);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(224, 231, 255); // indigo-100
    const descLines = this.doc.splitTextToSize(curriculum.description, PAGE.contentWidth - 20) as string[];
    this.doc.text(descLines, PAGE.width / 2, this.y, { align: "center" });
    this.y += descLines.length * FONT.body * 0.45 + 16;

    // Learning outcomes
    this.doc.setFontSize(FONT.small);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(255, 255, 255);
    this.doc.text("WHAT YOU'LL LEARN", PAGE.width / 2, this.y, { align: "center" });
    this.y += 6;

    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(224, 231, 255);
    for (const outcome of curriculum.objectives.slice(0, 4)) {
      const lines = this.doc.splitTextToSize(`• ${outcome}`, PAGE.contentWidth - 10) as string[];
      this.doc.text(lines, PAGE.width / 2, this.y, { align: "center" });
      this.y += lines.length * FONT.small * 0.42 + 2;
    }

    // Footer
    this.drawPageFooter();
  }

  /**
   * Builds the table of contents page from the stored TOC entries.
   * Call this AFTER all module pages have been added.
   */
  buildTOC(curriculum: Curriculum): void {
    this.newPage();
    this.gap(4);

    this.text("Table of Contents", FONT.h2, true, COLORS.primary);
    this.gap(2);
    this.hr();
    this.gap(4);

    // TOC entries
    for (const entry of this.toc) {
      this.ensureSpace(8);
      this.doc.setFontSize(FONT.body);
      this.doc.setFont("helvetica", "normal");
      this.color(COLORS.text);
      this.doc.text(entry.title, PAGE.marginLeft, this.y);
      this.doc.text(`${entry.page}`, PAGE.width - PAGE.marginRight, this.y, { align: "right" });

      // Dotted leader line
      this.doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
      const titleWidth = this.doc.getTextWidth(entry.title) + 4;
      const pageNumWidth = this.doc.getTextWidth(`${entry.page}`) + 4;
      this.doc.setLineDashPattern([0.5, 1.5], 0);
      this.doc.line(
        PAGE.marginLeft + titleWidth,
        this.y - 1,
        PAGE.width - PAGE.marginRight - pageNumWidth,
        this.y - 1
      );
      this.doc.setLineDashPattern([], 0);
      this.y += 7;
    }
  }

  /**
   * Builds a full module section (module header, lessons, quizzes).
   *
   * @param module    - The module to render
   * @param moduleIdx - Zero-based index (for display numbering)
   */
  buildModule(module: Module): void {
    this.newPage();

    // Strip any "Module N:" prefix the AI may have included in the title
    const cleanTitle = module.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "");
    const moduleHeading = `Module ${module.order + 1}: ${cleanTitle}`;

    // Register in TOC with current page number
    this.toc.push({
      title: moduleHeading,
      page: this.pageNum,
    });

    // Module header banner
    this.fill(COLORS.primary);
    this.doc.rect(PAGE.marginLeft - 5, this.y - 5, PAGE.contentWidth + 10, 18, "F");

    this.doc.setFontSize(FONT.h3);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(
      moduleHeading,
      PAGE.marginLeft,
      this.y + 6
    );
    this.y += 20;

    // Module description
    this.wrappedText(module.description, FONT.body, false, COLORS.textMuted);
    this.gap(6);

    // Lessons
    this.text("Lessons", FONT.h4, true, COLORS.primary);
    this.hr(1);
    this.gap(2);

    for (const lesson of module.lessons) {
      this.buildLesson(lesson);
    }

    // Quiz
    if (module.quiz && module.quiz.length > 0) {
      this.gap(4);
      this.text("Module Quiz", FONT.h4, true, COLORS.primary);
      this.hr(1);
      this.gap(2);

      for (let i = 0; i < module.quiz.length; i++) {
        this.buildQuizQuestion(module.quiz[i], i + 1);
      }
    }
  }

  /**
   * Renders a single lesson block.
   *
   * @param lesson - The lesson to render
   */
  private buildLesson(lesson: Lesson): void {
    this.ensureSpace(30);

    // Lesson title row
    this.doc.setFontSize(FONT.body);
    this.doc.setFont("helvetica", "bold");
    this.color(COLORS.text);
    this.doc.text(
      `${lesson.order + 1}. ${lesson.title}`,
      PAGE.marginLeft,
      this.y
    );

    // Duration badge (right-aligned)
    this.doc.setFontSize(FONT.tiny);
    this.doc.setFont("helvetica", "normal");
    this.color(COLORS.textMuted);
    this.doc.text(`⏱ ${lesson.durationMinutes}m`, PAGE.width - PAGE.marginRight, this.y, { align: "right" });
    this.y += FONT.body * 0.45;

    // Objective
    if (lesson.objectives && lesson.objectives.length > 0) {
      this.wrappedText(`Objective: ${lesson.objectives[0]}`, FONT.small, false, COLORS.textMuted, PAGE.marginLeft + 4);
    }

    this.gap(3);
  }

  /**
   * Renders a single quiz question with answer options and explanation.
   *
   * @param q     - The quiz question
   * @param num   - Question number (1-based)
   */
  private buildQuizQuestion(q: QuizQuestion, num: number): void {
    this.ensureSpace(35);

    // Question
    this.wrappedText(`Q${num}. ${q.question}`, FONT.body, true, COLORS.text);
    this.gap(1);

    // Answer options
    const letters = ["A", "B", "C", "D"];
    if (q.options) {
      for (let i = 0; i < q.options.length; i++) {
        const isCorrect = q.options[i] === q.correctAnswer || i === q.correctAnswer;
        const color = isCorrect ? COLORS.primary : COLORS.textMuted;
        const prefix = isCorrect ? `✓ ${letters[i]}.` : `   ${letters[i]}.`;
        this.wrappedText(`${prefix} ${q.options[i]}`, FONT.small, isCorrect, color, PAGE.marginLeft + 4);
      }
    }

    // Explanation
    this.gap(1);
    this.wrappedText(`Explanation: ${q.explanation}`, FONT.tiny, false, COLORS.textMuted, PAGE.marginLeft + 4);
    this.gap(4);
  }

  /**
   * Builds the pacing schedule page.
   *
   * @param curriculum - The curriculum containing the pacing schedule
   */
  buildPacingPage(curriculum: Curriculum): void {
    this.newPage();
    this.toc.push({ title: "Pacing Schedule", page: this.pageNum });

    this.text("Recommended Pacing Schedule", FONT.h2, true, COLORS.primary);
    this.hr();
    this.gap(2);

    this.wrappedText(
      `Total Duration: ${curriculum.pacing.totalHours} Hours`,
      FONT.body,
      true,
      COLORS.text
    );
    this.gap(4);

    // Table header
    this.fill(COLORS.lightGray);
    this.doc.rect(PAGE.marginLeft, this.y - 3, PAGE.contentWidth, 7, "F");
    this.doc.setFontSize(FONT.small);
    this.doc.setFont("helvetica", "bold");
    this.color(COLORS.text);
    this.doc.text("Week", PAGE.marginLeft + 2, this.y + 1);
    this.doc.text("Modules", PAGE.marginLeft + 30, this.y + 1);
    this.doc.text("Hours/Week", PAGE.marginLeft + 100, this.y + 1);
    this.y += 7;

    // Table rows
    if (curriculum.pacing.weeklyPlan) {
      for (const week of curriculum.pacing.weeklyPlan) {
        this.ensureSpace(8);
        this.doc.setFontSize(FONT.small);
        this.doc.setFont("helvetica", "normal");
        this.color(COLORS.text);
        this.doc.text(`Week ${week.week}`, PAGE.marginLeft + 2, this.y);
        
        const modulesText = week.moduleIds && week.moduleIds.length > 0 
          ? week.moduleIds.map(id => {
              const mod = curriculum.modules.find(m => m.id === id);
              return mod ? mod.title.replace(/^Module\s*\d+\s*[:\.]\s*/i, "") : id;
            }).join(", ")
          : week.label || "";
        this.doc.text(modulesText, PAGE.marginLeft + 30, this.y);
        this.doc.text(`${curriculum.pacing.hoursPerWeek}h`, PAGE.marginLeft + 100, this.y);
        this.y += 6;

        // Light row separator
        this.doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
        this.doc.line(PAGE.marginLeft, this.y - 1, PAGE.width - PAGE.marginRight, this.y - 1);
      }
    }
  }

  /**
   * Builds the bonus resources page.
   *
   * @param resources - Array of bonus resources
   */
  buildBonusResourcesPage(resources: BonusResource[]): void {
    this.newPage();
    this.toc.push({ title: "Bonus Resources", page: this.pageNum });

    this.text("Bonus Resources", FONT.h2, true, COLORS.primary);
    this.hr();
    this.gap(4);

    for (const resource of resources) {
      this.ensureSpace(16);

      // Resource type badge
      this.fill(COLORS.lightGray);
      const badgeWidth = this.doc.getTextWidth(resource.type.toUpperCase()) + 6;
      this.doc.rect(PAGE.marginLeft, this.y - 3.5, badgeWidth, 5.5, "F");
      this.doc.setFontSize(FONT.tiny);
      this.doc.setFont("helvetica", "bold");
      this.color(COLORS.textMuted);
      this.doc.text(resource.type.toUpperCase(), PAGE.marginLeft + 3, this.y);

      // Resource title
      this.doc.setFontSize(FONT.body);
      this.doc.setFont("helvetica", "bold");
      this.color(COLORS.text);
      this.doc.text(resource.title, PAGE.marginLeft + badgeWidth + 4, this.y);
      this.y += FONT.body * 0.45 + 2;

      // Description
      this.wrappedText(resource.description || "", FONT.small, false, COLORS.textMuted, PAGE.marginLeft + 4);
      this.gap(4);
    }
  }

  /**
   * Returns the completed jsPDF document.
   * Call this after all sections have been built.
   */
  getDocument(): jsPDF {
    return this.doc;
  }
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Generates a complete PDF document from a Curriculum object.
 *
 * Build order:
 *   1. Cover page
 *   2. Module sections (also populates the TOC)
 *   3. Pacing schedule
 *   4. Bonus resources
 *   5. Table of contents (inserted as page 2 after all pages are known)
 *
 * @param curriculum - The fully-populated Curriculum object
 * @returns A jsPDF instance ready to save or open
 *
 * @example
 *   const pdf = generateCurriculumPDF(curriculum)
 *   pdf.save(`${curriculum.title}.pdf`)
 */
export function generateCurriculumPDF(curriculum: Curriculum): jsPDF {
  const builder = new PDFBuilder();

  // 1. Cover page
  builder.buildCoverPage(curriculum);

  // 2. Module sections
  for (const module of curriculum.modules) {
    builder.buildModule(module);
  }

  // 3. Pacing schedule
  builder.buildPacingPage(curriculum);

  // 4. Bonus resources
  if (curriculum.bonusResources && curriculum.bonusResources.length > 0) {
    builder.buildBonusResourcesPage(curriculum.bonusResources);
  }

  // Note: TOC is built after modules so page numbers are known.
  // jsPDF doesn't support inserting pages at arbitrary positions,
  // so in a future iteration you could use pdf-lib for full TOC insertion.
  // For now, TOC is appended at the end of the document.
  builder.buildTOC(curriculum);

  return builder.getDocument();
}
