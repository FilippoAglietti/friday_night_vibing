import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
  UnderlineType,
  PageBreak,
  Packer,
  convertInchesToTwip,
  ShadingType,
  Footer,
} from "docx";
import { Curriculum, Module, Lesson, QuizQuestion, TeachingStyle } from "@/types/curriculum";

type DocxTheme = {
  primary: string;
  light: string;
  dark: string;
  accent: string;
  text: string;
  muted: string;
  lightGray: string;
  border: string;
};

type DocxFontFamily = "Calibri" | "Cambria";

type DocxStyleConfig = {
  fontFamily: DocxFontFamily;
  headingFont: DocxFontFamily;
  moduleWord: string;
  sectionWord: string;
  coverEyebrow: string | null;
  /** Label appended after the creator's name in the footer (e.g. "Academic Edition"). null = no label */
  editionLabel: string | null;
  coverItalic: boolean;
  theme: DocxTheme;
};

const THEMES: Record<TeachingStyle, DocxTheme> = {
  conversational: {
    primary: "6D28D9",
    light: "8B5CF6",
    dark: "4C1D95",
    accent: "A78BFA",
    text: "1F2937",
    muted: "6B7280",
    lightGray: "F5F3FF",
    border: "E9D5FF",
  },
  academic: {
    primary: "1E3A8A",
    light: "3B82F6",
    dark: "0F172A",
    accent: "94A3B8",
    text: "0F172A",
    muted: "475569",
    lightGray: "F1F5F9",
    border: "CBD5E1",
  },
  "hands-on": {
    primary: "047857",
    light: "10B981",
    dark: "064E3B",
    accent: "D97706",
    text: "1F2937",
    muted: "4B5563",
    lightGray: "ECFDF5",
    border: "A7F3D0",
  },
  storytelling: {
    primary: "9F1239",
    light: "E11D48",
    dark: "4C0519",
    accent: "F59E0B",
    text: "292524",
    muted: "78716C",
    lightGray: "FFF1F2",
    border: "FECDD3",
  },
};

const STYLE_CONFIG: Record<TeachingStyle, DocxStyleConfig> = {
  conversational: {
    fontFamily: "Calibri",
    headingFont: "Calibri",
    moduleWord: "Module",
    sectionWord: "Lesson",
    coverEyebrow: null,
    editionLabel: null,
    coverItalic: true,
    theme: THEMES.conversational,
  },
  academic: {
    fontFamily: "Cambria",
    headingFont: "Cambria",
    moduleWord: "Chapter",
    sectionWord: "Lesson",
    coverEyebrow: "A   M O N O G R A P H",
    editionLabel: "Academic Edition",
    coverItalic: false,
    theme: THEMES.academic,
  },
  "hands-on": {
    fontFamily: "Calibri",
    headingFont: "Calibri",
    moduleWord: "Session",
    sectionWord: "Exercise",
    coverEyebrow: "L E V E L  ·  S E S S I O N   P A C K",
    editionLabel: "Workshop Edition",
    coverItalic: false,
    theme: THEMES["hands-on"],
  },
  storytelling: {
    fontFamily: "Cambria",
    headingFont: "Cambria",
    moduleWord: "Chapter",
    sectionWord: "Scene",
    coverEyebrow: "A   C O U R S E,   T O L D   A S   A   S T O R Y",
    editionLabel: "Stories Edition",
    coverItalic: true,
    theme: THEMES.storytelling,
  },
};

// Module-level mutable theme/config — set at the top of generateCurriculumDocx
// and restored in finally so concurrent calls don't clobber each other mid-render.
let T: DocxTheme = THEMES.conversational;
let CFG: DocxStyleConfig = STYLE_CONFIG.conversational;

const romanNumerals = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
function romanize(n: number): string {
  if (n < romanNumerals.length) return romanNumerals[n];
  return String(n);
}

function stripModulePrefix(title: string): string {
  return title.replace(/^\s*(?:module|chapter|session|unit|lesson|scene)\s*\d+\s*[:.\-–—]\s*/i, "").trim() || title;
}

/**
 * Generate a premium Word document from a Curriculum object
 */
export async function generateCurriculumDocx(
  curriculum: Curriculum,
  opts?: { teachingStyle?: TeachingStyle | null; creatorName?: string | null }
): Promise<Blob> {
  const style: TeachingStyle = opts?.teachingStyle ?? "conversational";
  const creatorName = opts?.creatorName?.trim() || "Author";
  const prevTheme = T;
  const prevCfg = CFG;
  CFG = STYLE_CONFIG[style] ?? STYLE_CONFIG.conversational;
  T = CFG.theme;
  try {
  const brandMark = CFG.editionLabel
    ? `${creatorName} · ${CFG.editionLabel}`
    : `By ${creatorName}`;
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...createCoverPage(curriculum),
          new Paragraph({ text: "", pageBreakBefore: true }),
          ...createTableOfContents(curriculum),
          new Paragraph({ text: "", pageBreakBefore: true }),
          ...createCourseOverview(curriculum),
          new Paragraph({ text: "", pageBreakBefore: true }),
          ...createModuleSections(curriculum),
          new Paragraph({ text: "", pageBreakBefore: true }),
          ...createPacingSchedule(curriculum),
          new Paragraph({ text: "", pageBreakBefore: true }),
          ...createBonusResources(curriculum),
          new Paragraph({ text: "", pageBreakBefore: true }),
          ...createLearningChecklist(curriculum),
        ],
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                text: brandMark,
                alignment: AlignmentType.CENTER,
                style: "footer",
                children: [
                  new TextRun({
                    text: brandMark,
                    size: 18,
                    color: T.primary,
                    italics: CFG.coverItalic,
                    font: CFG.headingFont,
                  }),
                ],
              }),
            ],
          }),
        },
      },
    ],
  });

    return await Packer.toBlob(doc);
  } finally {
    T = prevTheme;
    CFG = prevCfg;
  }
}

/**
 * Create the cover page with title, subtitle, and stats
 */
function createCoverPage(curriculum: Curriculum): Paragraph[] {
  const totalLessons = curriculum.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );
  const totalHours = Math.round(curriculum.pacing.totalHours * 10) / 10;

  const blocks: Paragraph[] = [
    new Paragraph({ text: "" }),
    new Paragraph({ text: "" }),
    new Paragraph({ text: "" }),
  ];

  if (CFG.coverEyebrow) {
    blocks.push(
      new Paragraph({
        text: CFG.coverEyebrow,
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: CFG.coverEyebrow,
            size: 18,
            color: T.muted,
            font: CFG.headingFont,
            characterSpacing: 40,
          }),
        ],
      })
    );
  }

  blocks.push(
    new Paragraph({
      text: curriculum.title,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: curriculum.title,
          size: 72,
          bold: true,
          color: T.primary,
          font: CFG.headingFont,
        }),
      ],
    })
  );

  // Ornamental separator for serif styles (academic / storytelling)
  if (CFG.headingFont === "Cambria") {
    blocks.push(
      new Paragraph({
        text: "\u2014\u2003\u2726\u2003\u2014",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "\u2014\u2003\u2726\u2003\u2014",
            size: 22,
            color: T.accent,
            font: CFG.headingFont,
          }),
        ],
      })
    );
  }

  blocks.push(
    new Paragraph({
      text: curriculum.subtitle,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: curriculum.subtitle,
          size: 28,
          color: T.light,
          italics: CFG.coverItalic,
          font: CFG.headingFont,
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 300, after: 300 } }),
    createStatBox(CFG.moduleWord + "s", curriculum.modules.length.toString()),
    new Paragraph({ text: "" }),
    createStatBox("Lessons", totalLessons.toString()),
    new Paragraph({ text: "" }),
    createStatBox("Hours", totalHours.toString()),
    new Paragraph({ text: "" }),
    createStatBox("Level", curriculum.difficulty.charAt(0).toUpperCase() + curriculum.difficulty.slice(1)),
    new Paragraph({ text: "", spacing: { before: 400 } }),
    new Paragraph({
      text: curriculum.description,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200, line: 360 },
      children: [
        new TextRun({
          text: curriculum.description,
          size: 22,
          color: T.text,
          font: CFG.fontFamily,
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 300 } }),
    new Paragraph({
      text: "Target Audience",
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "Target Audience",
          size: 20,
          bold: true,
          color: T.primary,
          font: CFG.headingFont,
        }),
      ],
    }),
    new Paragraph({
      text: curriculum.targetAudience,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: curriculum.targetAudience,
          size: 22,
          color: T.text,
          font: CFG.fontFamily,
        }),
      ],
    })
  );

  return blocks;
}

/**
 * Create a stat box in the cover page
 */
function createStatBox(label: string, value: string): Paragraph {
  return new Paragraph({
    text: `${label}: ${value}`,
    alignment: AlignmentType.CENTER,
    spacing: { line: 240 },
    children: [
      new TextRun({
        text: `${label}: `,
        size: 24,
        bold: true,
        color: T.dark,
        font: CFG.headingFont,
      }),
      new TextRun({
        text: value,
        size: 28,
        bold: true,
        color: T.primary,
        font: CFG.headingFont,
      }),
    ],
  });
}

/**
 * Create the Table of Contents section
 */
function createTableOfContents(curriculum: Curriculum): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: "Table of Contents",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "Table of Contents",
          size: 32,
          bold: true,
          color: T.primary,
        }),
      ],
    }),
  ];

  // Add module entries
  curriculum.modules.forEach((module, idx) => {
    const tocLabel = `${CFG.moduleWord} ${idx + 1}. ${stripModulePrefix(module.title)}`;
    paragraphs.push(
      new Paragraph({
        text: tocLabel,
        spacing: { after: 120, before: 80 },
        children: [
          new TextRun({
            text: tocLabel,
            size: 22,
            bold: true,
            color: T.text,
            font: CFG.headingFont,
          }),
        ],
      })
    );

    // Add lesson entries
    module.lessons.forEach((lesson) => {
      paragraphs.push(
        new Paragraph({
          text: `  • ${lesson.title}`,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `  • ${lesson.title}`,
              size: 20,
              color: T.text,
            }),
          ],
        })
      );
    });
  });

  return paragraphs;
}

/**
 * Create the Course Overview section
 */
function createCourseOverview(curriculum: Curriculum): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: "Course Overview",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "Course Overview",
          size: 32,
          bold: true,
          color: T.primary,
        }),
      ],
    }),

    // Learning Objectives
    new Paragraph({
      text: "Learning Objectives",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: "Learning Objectives",
          size: 26,
          bold: true,
          color: T.light,
        }),
      ],
    }),
  ];

  // Add objectives as numbered list
  curriculum.objectives.forEach((obj, idx) => {
    paragraphs.push(
      new Paragraph({
        text: obj,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `${idx + 1}. `,
            bold: true,
            color: T.primary,
            size: 22,
          }),
          new TextRun({
            text: obj,
            size: 22,
            color: T.text,
          }),
        ],
      })
    );
  });

  // Prerequisites
  if (curriculum.prerequisites && curriculum.prerequisites.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { before: 200 },
      }),
      new Paragraph({
        text: "Prerequisites",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "Prerequisites",
            size: 26,
            bold: true,
            color: T.light,
          }),
        ],
      })
    );

    curriculum.prerequisites.forEach((prereq) => {
      paragraphs.push(
        new Paragraph({
          text: prereq,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "• ",
              bold: true,
              color: T.primary,
            }),
            new TextRun({
              text: prereq,
              size: 22,
            }),
          ],
        })
      );
    });
  }

  // Pacing Information
  paragraphs.push(
    new Paragraph({
      text: "",
      spacing: { before: 200 },
    }),
    new Paragraph({
      text: "Pacing Information",
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Pacing Information",
          size: 26,
          bold: true,
          color: T.light,
        }),
      ],
    }),
    new Paragraph({
      text: `Style: ${curriculum.pacing.style.charAt(0).toUpperCase() + curriculum.pacing.style.slice(1).replace("-", " ")}`,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "Style: ",
          bold: true,
          color: T.primary,
        }),
        new TextRun({
          text: curriculum.pacing.style
            .charAt(0)
            .toUpperCase() + curriculum.pacing.style.slice(1).replace("-", " "),
        }),
      ],
    }),
    new Paragraph({
      text: `Total Hours: ${curriculum.pacing.totalHours}`,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "Total Hours: ",
          bold: true,
          color: T.primary,
        }),
        new TextRun({
          text: curriculum.pacing.totalHours.toString(),
        }),
      ],
    }),
    new Paragraph({
      text: `Hours Per Week: ${curriculum.pacing.hoursPerWeek}`,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "Hours Per Week: ",
          bold: true,
          color: T.primary,
        }),
        new TextRun({
          text: curriculum.pacing.hoursPerWeek.toString(),
        }),
      ],
    }),
    new Paragraph({
      text: `Total Weeks: ${curriculum.pacing.totalWeeks}`,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "Total Weeks: ",
          bold: true,
          color: T.primary,
        }),
        new TextRun({
          text: curriculum.pacing.totalWeeks.toString(),
        }),
      ],
    })
  );

  return paragraphs;
}

/**
 * Create individual module sections with lessons and quizzes
 */
function createModuleSections(curriculum: Curriculum): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  curriculum.modules.forEach((module, moduleIdx) => {
    const cleanTitle = stripModulePrefix(module.title);
    const numberLabel =
      CFG.moduleWord === "Chapter" && CFG.headingFont === "Cambria" && CFG.coverItalic
        ? romanize(moduleIdx + 1)
        : String(moduleIdx + 1);
    const eyebrow = `${CFG.moduleWord.toUpperCase()} ${numberLabel}`;
    // Eyebrow label (small caps, spaced) — gives each style a distinct module marker.
    paragraphs.push(
      new Paragraph({
        text: eyebrow,
        spacing: { before: 400, after: 80 },
        children: [
          new TextRun({
            text: eyebrow,
            size: 18,
            bold: true,
            color: T.accent,
            font: CFG.headingFont,
            characterSpacing: 40,
          }),
        ],
      }),
      new Paragraph({
        text: cleanTitle,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: cleanTitle,
            size: 36,
            bold: true,
            color: T.primary,
            font: CFG.headingFont,
            italics: CFG.coverItalic && CFG.headingFont === "Cambria",
          }),
        ],
      }),
      new Paragraph({
        text: module.description,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: module.description,
            size: 22,
            color: T.text,
            font: CFG.fontFamily,
          }),
        ],
      })
    );

    // Module objectives
    if (module.objectives && module.objectives.length > 0) {
      const objHeading = `${CFG.moduleWord} Objectives`;
      paragraphs.push(
        new Paragraph({
          text: objHeading,
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: objHeading,
              size: 26,
              bold: true,
              color: T.light,
              font: CFG.headingFont,
            }),
          ],
        })
      );

      module.objectives.forEach((obj, idx) => {
        paragraphs.push(
          new Paragraph({
            text: obj,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `${idx + 1}. `,
                bold: true,
                color: T.primary,
              }),
              new TextRun({
                text: obj,
                size: 20,
              }),
            ],
          })
        );
      });

      paragraphs.push(
        new Paragraph({
          text: "",
          spacing: { after: 200 },
        })
      );
    }

    // Lessons
    module.lessons.forEach((lesson, lessonIdx) => {
      paragraphs.push(...createLessonContent(lesson, lessonIdx, moduleIdx));
    });

    // Module quiz
    if (module.quiz && module.quiz.length > 0) {
      const quizHeading = `${CFG.moduleWord} Quiz`;
      paragraphs.push(
        new Paragraph({
          text: "",
          spacing: { before: 300 },
        }),
        new Paragraph({
          text: quizHeading,
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: quizHeading,
              size: 26,
              bold: true,
              color: T.light,
              font: CFG.headingFont,
            }),
          ],
        })
      );

      module.quiz.forEach((question, qIdx) => {
        paragraphs.push(...createQuestionContent(question, qIdx));
      });
    }

    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { before: 300, after: 300 },
      })
    );
  });

  return paragraphs;
}

/**
 * Strip basic markdown formatting from text and return plain text
 */
function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1") // Italic
    .replace(/__(.*?)__/g, "$1") // Bold alternative
    .replace(/_(.*?)_/g, "$1") // Italic alternative
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // Links
    .replace(/^#+\s+/gm, "") // Headers
    .replace(/^-\s+/gm, "") // Unordered lists
    .replace(/^\d+\.\s+/gm, ""); // Ordered lists
}

/**
 * Split markdown content into paragraphs and return as Paragraph objects
 */
function createContentParagraphs(markdown: string | undefined): Paragraph[] {
  if (!markdown || !markdown.trim()) {
    return [];
  }

  // Split by double newlines to get paragraphs
  const paragraphTexts = markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphTexts.map(
    (text) =>
      new Paragraph({
        text: stripMarkdown(text),
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: stripMarkdown(text),
            size: 18,
            color: T.text,
          }),
        ],
      })
  );
}

/**
 * Create lesson content with title, format badge, duration, objectives, key points, and resources
 */
function createLessonContent(
  lesson: Lesson,
  lessonIdx: number,
  moduleIdx: number
): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: `Lesson ${lessonIdx + 1}: ${lesson.title}`,
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 150 },
      children: [
        new TextRun({
          text: `Lesson ${lessonIdx + 1}: ${lesson.title}`,
          size: 24,
          bold: true,
          color: T.dark,
        }),
      ],
    }),

    // Duration
    new Paragraph({
      text: `Duration: ${lesson.durationMinutes} minutes`,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Duration: `,
          bold: true,
          color: T.primary,
          size: 20,
        }),
        new TextRun({
          text: `${lesson.durationMinutes} minutes`,
          size: 20,
        }),
      ],
    }),

    // Description
    new Paragraph({
      text: lesson.description,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: lesson.description,
          size: 20,
          color: T.text,
        }),
      ],
    }),
  ];

  // Lesson content (rich markdown body text)
  if (lesson.content && lesson.content.trim()) {
    paragraphs.push(...createContentParagraphs(lesson.content));
    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { after: 150 },
      })
    );
  }

  // Lesson objectives
  if (lesson.objectives && lesson.objectives.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: "Objectives",
        heading: HeadingLevel.HEADING_4,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: "Objectives",
            size: 22,
            bold: true,
            color: T.light,
          }),
        ],
      })
    );

    lesson.objectives.forEach((obj) => {
      paragraphs.push(
        new Paragraph({
          text: obj,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "• ",
              bold: true,
              color: T.primary,
            }),
            new TextRun({
              text: obj,
              size: 20,
            }),
          ],
        })
      );
    });

    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { after: 150 },
      })
    );
  }

  // Key points
  if (lesson.keyPoints && lesson.keyPoints.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: "Key Points",
        heading: HeadingLevel.HEADING_4,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: "Key Points",
            size: 22,
            bold: true,
            color: T.light,
          }),
        ],
      })
    );

    lesson.keyPoints.forEach((point, idx) => {
      paragraphs.push(
        new Paragraph({
          text: point,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${idx + 1}. `,
              bold: true,
              color: T.primary,
            }),
            new TextRun({
              text: point,
              size: 20,
            }),
          ],
        })
      );
    });

    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { after: 150 },
      })
    );
  }

  // Suggested resources
  if (lesson.suggestedResources && lesson.suggestedResources.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: "Suggested Resources",
        heading: HeadingLevel.HEADING_4,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: "Suggested Resources",
            size: 22,
            bold: true,
            color: T.light,
          }),
        ],
      })
    );

    lesson.suggestedResources.forEach((resource) => {
      paragraphs.push(
        new Paragraph({
          text: `${resource.title} (${resource.type})`,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: "• ",
              bold: true,
              color: T.primary,
            }),
            new TextRun({
              text: resource.title,
              size: 20,
              bold: true,
            }),
            new TextRun({
              text: ` (${resource.type})`,
              size: 20,
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          text: `${resource.url}`,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${resource.url}`,
              size: 18,
              color: "0066CC",
            }),
          ],
        })
      );
    });
  }

  // Lesson quiz
  if (lesson.quiz && lesson.quiz.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { before: 150, after: 100 },
      }),
      new Paragraph({
        text: "Lesson Quiz",
        heading: HeadingLevel.HEADING_4,
        spacing: { after: 150 },
        children: [
          new TextRun({
            text: "Lesson Quiz",
            size: 22,
            bold: true,
            color: T.light,
          }),
        ],
      })
    );

    lesson.quiz.forEach((question, qIdx) => {
      paragraphs.push(...createQuestionContent(question, qIdx));
    });
  }

  return paragraphs;
}

/**
 * Create quiz question content
 */
function createQuestionContent(question: QuizQuestion, qIdx: number): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: `Question ${qIdx + 1}: ${question.question}`,
      spacing: { before: 100, after: 150 },
      children: [
        new TextRun({
          text: `Question ${qIdx + 1}: `,
          bold: true,
          color: T.primary,
          size: 20,
        }),
        new TextRun({
          text: question.question,
          size: 20,
        }),
      ],
    }),
  ];

  // Options
  if (question.options && question.options.length > 0) {
    question.options.forEach((option, optIdx) => {
      const isCorrect =
        typeof question.correctAnswer === "number" &&
        question.correctAnswer === optIdx;

      paragraphs.push(
        new Paragraph({
          text: `${String.fromCharCode(65 + optIdx)}. ${option}`,
          spacing: { after: 80 },
          shading: isCorrect
            ? {
                type: ShadingType.CLEAR,
                color: "E0F2FE",
                fill: "E0F2FE",
              }
            : undefined,
          children: [
            new TextRun({
              text: `${String.fromCharCode(65 + optIdx)}. `,
              bold: true,
              color: isCorrect ? T.primary : T.text,
              size: 20,
            }),
            new TextRun({
              text: option,
              size: 20,
              bold: isCorrect,
              color: isCorrect ? T.primary : T.text,
            }),
            isCorrect
              ? new TextRun({
                  text: " ✓",
                  bold: true,
                  color: "10B981",
                  size: 20,
                })
              : new TextRun({
                  text: "",
                }),
          ],
        })
      );
    });
  }

  // Explanation
  if (question.explanation) {
    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `Explanation: ${question.explanation}`,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "Explanation: ",
            bold: true,
            color: T.primary,
            size: 20,
          }),
          new TextRun({
            text: question.explanation,
            size: 20,
            italics: true,
          }),
        ],
      })
    );
  }

  return paragraphs;
}

/**
 * Create the pacing schedule as a formatted table
 */
function createPacingSchedule(curriculum: Curriculum): (Paragraph | Table)[] {
  const paragraphs: (Paragraph | Table)[] = [
    new Paragraph({
      text: "Pacing Schedule",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "Pacing Schedule",
          size: 32,
          bold: true,
          color: T.primary,
        }),
      ],
    }),
  ];

  // Summary
  paragraphs.push(
    new Paragraph({
      text: `This ${curriculum.pacing.style} course is designed to be completed over ${curriculum.pacing.totalWeeks} weeks at ${curriculum.pacing.hoursPerWeek} hours per week, for a total of ${curriculum.pacing.totalHours} hours.`,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `This ${curriculum.pacing.style} course is designed to be completed over ${curriculum.pacing.totalWeeks} weeks at ${curriculum.pacing.hoursPerWeek} hours per week, for a total of ${curriculum.pacing.totalHours} hours.`,
          size: 22,
          color: T.text,
        }),
      ],
    })
  );

  // Weekly plan table
  if (curriculum.pacing.weeklyPlan && curriculum.pacing.weeklyPlan.length > 0) {
    const tableRows: TableRow[] = [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: "Week",
                children: [
                  new TextRun({
                    text: "Week",
                    bold: true,
                    color: "FFFFFF",
                    size: 22,
                  }),
                ],
              }),
            ],
            shading: {
              type: ShadingType.CLEAR,
              color: T.primary,
              fill: T.primary,
            },
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: "Focus",
                children: [
                  new TextRun({
                    text: "Focus",
                    bold: true,
                    color: "FFFFFF",
                    size: 22,
                  }),
                ],
              }),
            ],
            shading: {
              type: ShadingType.CLEAR,
              color: T.primary,
              fill: T.primary,
            },
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
        height: { value: 500, rule: "atLeast" },
      }),
    ];

    // Data rows
    curriculum.pacing.weeklyPlan.forEach((week, idx) => {
      const moduleLabels = week.moduleIds
        .map((id) => {
          const module = curriculum.modules.find((m) => m.id === id);
          return module ? module.title : id;
        })
        .join(", ");

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  text: `Week ${week.week}`,
                  children: [
                    new TextRun({
                      text: `Week ${week.week}`,
                      bold: true,
                      size: 22,
                    }),
                  ],
                }),
              ],
              shading: idx % 2 === 0 ? undefined : {
                type: ShadingType.CLEAR,
                color: T.lightGray,
                fill: T.lightGray,
              },
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: week.label ? `${week.label} (${moduleLabels})` : moduleLabels,
                  children: [
                    new TextRun({
                      text: week.label
                        ? `${week.label} (${moduleLabels})`
                        : moduleLabels,
                      size: 22,
                    }),
                  ],
                }),
              ],
              shading: idx % 2 === 0 ? undefined : {
                type: ShadingType.CLEAR,
                color: T.lightGray,
                fill: T.lightGray,
              },
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
          height: { value: 500, rule: "atLeast" },
        })
      );
    });

    paragraphs.push(
      new Table({
        width: { size: 100, type: "pct" },
        rows: tableRows,
        borders: {
          top: {
            color: T.border,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
          bottom: {
            color: T.border,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
          left: {
            color: T.border,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
          right: {
            color: T.border,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
          insideHorizontal: {
            color: T.border,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
          insideVertical: {
            color: T.border,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
  }

  return paragraphs;
}

/**
 * Create the bonus resources section
 */
function createBonusResources(curriculum: Curriculum): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: "Bonus Resources",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "Bonus Resources",
          size: 32,
          bold: true,
          color: T.primary,
        }),
      ],
    }),
  ];

  if (!curriculum.bonusResources || curriculum.bonusResources.length === 0) {
    paragraphs.push(
      new Paragraph({
        text: "No bonus resources available for this curriculum.",
        children: [
          new TextRun({
            text: "No bonus resources available for this curriculum.",
            size: 22,
            italics: true,
            color: "6B7280",
          }),
        ],
      })
    );
    return paragraphs;
  }

  curriculum.bonusResources.forEach((resource) => {
    paragraphs.push(
      new Paragraph({
        text: `${resource.title}`,
        spacing: { before: 150, after: 80 },
        children: [
          new TextRun({
            text: resource.title,
            size: 22,
            bold: true,
            color: T.primary,
          }),
        ],
      }),
      new Paragraph({
        text: `Type: ${resource.type} | ${resource.isFree ? "Free" : "Paid"}${resource.durationMinutes ? ` | ${resource.durationMinutes} min` : ""}`,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `Type: `,
            bold: true,
            color: T.light,
            size: 20,
          }),
          new TextRun({
            text: `${resource.type} | ${resource.isFree ? "Free" : "Paid"}${resource.durationMinutes ? ` | ${resource.durationMinutes} min` : ""}`,
            size: 20,
          }),
        ],
      })
    );

    if (resource.description) {
      paragraphs.push(
        new Paragraph({
          text: resource.description,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: resource.description,
              size: 20,
              color: T.text,
            }),
          ],
        })
      );
    }

    paragraphs.push(
      new Paragraph({
        text: resource.url,
        spacing: { after: 150 },
        children: [
          new TextRun({
            text: resource.url,
            size: 20,
            color: "0066CC",
          }),
        ],
      })
    );
  });

  return paragraphs;
}

/**
 * Create the learning checklist section
 */
function createLearningChecklist(curriculum: Curriculum): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: "Learning Checklist",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "Learning Checklist",
          size: 32,
          bold: true,
          color: T.primary,
        }),
      ],
    }),
    new Paragraph({
      text: "Use this checklist to track your progress through the curriculum.",
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "Use this checklist to track your progress through the curriculum.",
          size: 22,
          italics: true,
          color: T.text,
        }),
      ],
    }),
  ];

  curriculum.modules.forEach((module, moduleIdx) => {
    const label = `${CFG.moduleWord} ${moduleIdx + 1}: ${stripModulePrefix(module.title)}`;
    paragraphs.push(
      new Paragraph({
        text: label,
        spacing: { before: 200, after: 150 },
        children: [
          new TextRun({
            text: label,
            size: 24,
            bold: true,
            color: T.dark,
            font: CFG.headingFont,
          }),
        ],
      })
    );

    module.lessons.forEach((lesson) => {
      paragraphs.push(
        new Paragraph({
          text: `☐ ${lesson.title}`,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `☐ `,
              size: 22,
              color: T.primary,
            }),
            new TextRun({
              text: lesson.title,
              size: 22,
              color: T.text,
            }),
          ],
        })
      );
    });

    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { after: 150 },
      })
    );
  });

  return paragraphs;
}

