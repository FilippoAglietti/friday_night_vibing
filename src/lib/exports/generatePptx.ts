// @ts-nocheck
// pptxgenjs typings are incomplete for v4 — runtime API is correct
import PptxGenJS from "pptxgenjs";
import type { Curriculum, Module, Lesson, DifficultyLevel } from "@/types/curriculum";

// ─────────────────────────────────────────────────────────
// Brand Colors & Theme
// ─────────────────────────────────────────────────────────
const COLORS = {
  primary: "#6D28D9",    // Violet
  light: "#8B5CF6",      // Light Violet
  dark: "#4C1D95",       // Dark Violet
  bg: "#F5F3FF",         // Light Background
  white: "#FFFFFF",
  text: "#1F2937",       // Dark Gray
  lightText: "#6B7280",  // Medium Gray
  accentBar: "#6D28D9",
} as const;

// ─────────────────────────────────────────────────────────
// Slide Configuration
// ─────────────────────────────────────────────────────────
const SLIDE_CONFIG = {
  width: 10,
  height: 5.625,
  margin: 0.4,
  contentMargin: 0.6,
} as const;

// Font sizes
const FONTS = {
  title: 28,
  subtitle: 18,
  heading: 22,
  body: 14,
  small: 11,
  tiny: 9,
} as const;

// ─────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────

/**
 * Add a decorative bottom accent bar to every slide
 */
function addAccentBar(pres: PptxGenJS) {
  const barHeight = 0.12;
  const bar: Record<string, unknown> = {
    shape: pres.ShapeType.rect,
    x: 0,
    y: SLIDE_CONFIG.height - barHeight,
    w: SLIDE_CONFIG.width,
    h: barHeight,
    fill: { color: COLORS.primary },
    line: { type: "none" },
  };
  pres.addShape(bar);
}

/**
 * Add a decorative accent circle for visual interest
 */
function addAccentCircle(pres: PptxGenJS, x: number, y: number, size: number, color: string = COLORS.light) {
  const circle: Record<string, unknown> = {
    shape: pres.ShapeType.ellipse,
    x,
    y,
    w: size,
    h: size,
    fill: { color },
    line: { type: "none" },
  };
  pres.addShape(circle);
}

/**
 * Format duration in minutes to readable string
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get badge color based on difficulty
 */
function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case "beginner":
      return "#10B981";
    case "intermediate":
      return "#F59E0B";
    case "advanced":
      return "#EF4444";
    default:
      return COLORS.light;
  }
}

/**
 * Create a title slide with branding
 */
function addTitleSlide(pres: PptxGenJS, curriculum: Curriculum) {
  const slide = pres.addSlide();
  
  // Background
  slide.background = { color: COLORS.white };
  
  // Decorative circles
  addAccentCircle(pres, -0.3, -0.3, 1.2, COLORS.light);
  addAccentCircle(pres, SLIDE_CONFIG.width - 0.5, SLIDE_CONFIG.height - 0.8, 1, COLORS.bg);
  
  // Main title
  slide.addText(curriculum.title, {
    x: SLIDE_CONFIG.contentMargin,
    y: 1.2,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 1.5,
    fontSize: FONTS.title,
    bold: true,
    color: COLORS.primary,
    align: "center",
    valign: "middle",
    fontFace: "Segoe UI",
  });
  
  // Subtitle
  slide.addText(curriculum.subtitle, {
    x: SLIDE_CONFIG.contentMargin,
    y: 2.8,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.6,
    fontSize: FONTS.subtitle,
    color: COLORS.lightText,
    align: "center",
    valign: "middle",
    fontFace: "Segoe UI",
  });
  
  // Difficulty badge
  const badgeColor = getDifficultyColor(curriculum.difficulty);
  const badgeX = SLIDE_CONFIG.width / 2 - 0.6;
  const badgeY = 3.6;
  
  const badge: Record<string, unknown> = {
    shape: pres.ShapeType.roundRect,
    x: badgeX,
    y: badgeY,
    w: 1.2,
    h: 0.4,
    fill: { color: badgeColor },
    line: { type: "none" },
  };
  slide.addShape(badge);
  
  slide.addText(curriculum.difficulty.charAt(0).toUpperCase() + curriculum.difficulty.slice(1), {
    x: badgeX,
    y: badgeY,
    w: 1.2,
    h: 0.4,
    fontSize: FONTS.small,
    color: COLORS.white,
    bold: true,
    align: "center",
    valign: "middle",
    fontFace: "Segoe UI",
  });
  
  // Stats row
  const totalLessons = curriculum.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const statsY = 4.3;
  const statWidth = (SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin) / 3;
  
  const stats = [
    { label: "Modules", value: curriculum.modules.length.toString() },
    { label: "Lessons", value: totalLessons.toString() },
    { label: "Hours", value: curriculum.pacing.totalHours.toFixed(1) },
  ];
  
  stats.forEach((stat, idx) => {
    const x = SLIDE_CONFIG.contentMargin + idx * statWidth;
    
    // Value
    slide.addText(stat.value, {
      x,
      y: statsY,
      w: statWidth,
      h: 0.35,
      fontSize: FONTS.heading,
      bold: true,
      color: COLORS.primary,
      align: "center",
      valign: "bottom",
      fontFace: "Segoe UI",
    });
    
    // Label
    slide.addText(stat.label, {
      x,
      y: statsY + 0.35,
      w: statWidth,
      h: 0.25,
      fontSize: FONTS.small,
      color: COLORS.lightText,
      align: "center",
      valign: "top",
      fontFace: "Segoe UI",
    });
  });
  
  addAccentBar(pres);
}

/**
 * Course overview slide
 */
function addOverviewSlide(pres: PptxGenJS, curriculum: Curriculum) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };
  addAccentBar(pres);
  
  // Title with accent
  const titleBox: Record<string, unknown> = {
    shape: pres.ShapeType.rect,
    x: 0,
    y: 0,
    w: 0.08,
    h: 0.5,
    fill: { color: COLORS.primary },
    line: { type: "none" },
  };
  slide.addShape(titleBox);
  
  slide.addText("Course Overview", {
    x: SLIDE_CONFIG.contentMargin,
    y: 0.08,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.5,
    fontSize: FONTS.heading,
    bold: true,
    color: COLORS.primary,
    fontFace: "Segoe UI",
  });
  
  // Description
  slide.addText("Description", {
    x: SLIDE_CONFIG.contentMargin,
    y: 0.75,
    w: 2,
    h: 0.3,
    fontSize: FONTS.body,
    bold: true,
    color: COLORS.text,
    fontFace: "Segoe UI",
  });
  
  slide.addText(curriculum.description, {
    x: SLIDE_CONFIG.contentMargin,
    y: 1.1,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.8,
    fontSize: FONTS.small,
    color: COLORS.lightText,
    align: "left",
    valign: "top",
    wrap: true,
    fontFace: "Segoe UI",
  });
  
  // Target Audience
  slide.addText("Target Audience", {
    x: SLIDE_CONFIG.contentMargin,
    y: 2.05,
    w: 2,
    h: 0.3,
    fontSize: FONTS.body,
    bold: true,
    color: COLORS.text,
    fontFace: "Segoe UI",
  });
  
  slide.addText(curriculum.targetAudience, {
    x: SLIDE_CONFIG.contentMargin,
    y: 2.4,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.6,
    fontSize: FONTS.small,
    color: COLORS.lightText,
    wrap: true,
    fontFace: "Segoe UI",
  });
  
  // Learning Objectives
  slide.addText("Learning Objectives", {
    x: SLIDE_CONFIG.contentMargin,
    y: 3.15,
    w: 2.5,
    h: 0.3,
    fontSize: FONTS.body,
    bold: true,
    color: COLORS.text,
    fontFace: "Segoe UI",
  });
  
  const objX = SLIDE_CONFIG.contentMargin;
  const objY = 3.5;
  const objHeight = SLIDE_CONFIG.height - SLIDE_CONFIG.contentMargin - 0.5 - objY;
  
  let currentY = objY;
  curriculum.objectives.slice(0, 3).forEach((obj) => {
    slide.addText("•", {
      x: objX,
      y: currentY,
      w: 0.2,
      h: 0.25,
      fontSize: FONTS.small,
      color: COLORS.primary,
      bold: true,
      fontFace: "Segoe UI",
    });
    
    slide.addText(obj, {
      x: objX + 0.25,
      y: currentY,
      w: SLIDE_CONFIG.width - objX - 0.25 - SLIDE_CONFIG.contentMargin,
      h: 0.25,
      fontSize: FONTS.small,
      color: COLORS.text,
      wrap: true,
      fontFace: "Segoe UI",
    });
    
    currentY += 0.3;
  });
}

/**
 * Course Roadmap slide - shows module overview
 */
function addRoadmapSlide(pres: PptxGenJS, curriculum: Curriculum) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };
  addAccentBar(pres);
  
  // Title
  const titleBox: Record<string, unknown> = {
    shape: pres.ShapeType.rect,
    x: 0,
    y: 0,
    w: 0.08,
    h: 0.5,
    fill: { color: COLORS.primary },
    line: { type: "none" },
  };
  slide.addShape(titleBox);
  
  slide.addText("Course Roadmap", {
    x: SLIDE_CONFIG.contentMargin,
    y: 0.08,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.5,
    fontSize: FONTS.heading,
    bold: true,
    color: COLORS.primary,
    fontFace: "Segoe UI",
  });
  
  // Create table
  const tableData: PptxGenJS.TableCell[][] = [
    [
      { text: "Module", options: { bold: true, fontSize: FONTS.body, color: COLORS.white, fill: { color: COLORS.primary } } },
      { text: "Title", options: { bold: true, fontSize: FONTS.body, color: COLORS.white, fill: { color: COLORS.primary } } },
      { text: "Lessons", options: { bold: true, fontSize: FONTS.body, color: COLORS.white, fill: { color: COLORS.primary } } },
      { text: "Duration", options: { bold: true, fontSize: FONTS.body, color: COLORS.white, fill: { color: COLORS.primary } } },
    ],
  ];
  
  curriculum.modules.forEach((module, idx) => {
    tableData.push([
      { text: (idx + 1).toString(), options: { fontSize: FONTS.small, color: COLORS.text } },
      { text: module.title, options: { fontSize: FONTS.small, color: COLORS.text } },
      { text: module.lessons.length.toString(), options: { fontSize: FONTS.small, color: COLORS.text } },
      { text: formatDuration(module.durationMinutes), options: { fontSize: FONTS.small, color: COLORS.text } },
    ]);
  });
  
  slide.addTable(tableData, {
    x: SLIDE_CONFIG.contentMargin,
    y: 0.8,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: SLIDE_CONFIG.height - 1.4,
    colW: [0.8, 4, 1, 1.5],
    border: [{ pt: 1, color: COLORS.bg }],
    rowH: 0.35,
    fontFace: "Segoe UI",
  });
}

/**
 * Module intro slide
 */
function addModuleSlide(pres: PptxGenJS, module: Module, moduleIndex: number) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.bg };
  
  // Accent shape
  const accentShape: Record<string, unknown> = {
    shape: pres.ShapeType.rect,
    x: SLIDE_CONFIG.width - 0.15,
    y: 0,
    w: 0.15,
    h: SLIDE_CONFIG.height,
    fill: { color: COLORS.primary },
    line: { type: "none" },
  };
  slide.addShape(accentShape);
  
  // Module number badge
  const badgeSize = 1.2;
  const badgeX = SLIDE_CONFIG.contentMargin;
  const badgeY = SLIDE_CONFIG.contentMargin;
  
  const badge: Record<string, unknown> = {
    shape: pres.ShapeType.ellipse,
    x: badgeX,
    y: badgeY,
    w: badgeSize,
    h: badgeSize,
    fill: { color: COLORS.primary },
    line: { type: "none" },
  };
  slide.addShape(badge);
  
  slide.addText(`${moduleIndex + 1}`, {
    x: badgeX,
    y: badgeY,
    w: badgeSize,
    h: badgeSize,
    fontSize: FONTS.heading,
    bold: true,
    color: COLORS.white,
    align: "center",
    valign: "middle",
    fontFace: "Segoe UI",
  });
  
  // Module title
  slide.addText(module.title, {
    x: SLIDE_CONFIG.contentMargin + 1.5,
    y: badgeY + 0.2,
    w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2 - 1.5,
    h: 0.8,
    fontSize: FONTS.title,
    bold: true,
    color: COLORS.primary,
    wrap: true,
    fontFace: "Segoe UI",
  });
  
  // Description
  slide.addText(module.description, {
    x: SLIDE_CONFIG.contentMargin,
    y: 1.8,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin - 0.15,
    h: 0.8,
    fontSize: FONTS.body,
    color: COLORS.text,
    wrap: true,
    fontFace: "Segoe UI",
  });
  
  // Objectives
  slide.addText("Learning Objectives", {
    x: SLIDE_CONFIG.contentMargin,
    y: 2.8,
    w: 2,
    h: 0.3,
    fontSize: FONTS.body,
    bold: true,
    color: COLORS.primary,
    fontFace: "Segoe UI",
  });
  
  let objY = 3.15;
  module.objectives.slice(0, 2).forEach((obj) => {
    slide.addText("•", {
      x: SLIDE_CONFIG.contentMargin,
      y: objY,
      w: 0.2,
      h: 0.25,
      fontSize: FONTS.small,
      color: COLORS.primary,
      bold: true,
      fontFace: "Segoe UI",
    });
    
    slide.addText(obj, {
      x: SLIDE_CONFIG.contentMargin + 0.25,
      y: objY,
      w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2 - 0.25 - 0.15,
      h: 0.25,
      fontSize: FONTS.small,
      color: COLORS.text,
      wrap: true,
      fontFace: "Segoe UI",
    });
    
    objY += 0.3;
  });
  
  addAccentBar(pres);
}

/**
 * Lesson slide
 */
function addLessonSlide(pres: PptxGenJS, lesson: Lesson, moduleTitle: string) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };
  addAccentBar(pres);
  
  // Title bar accent
  const titleBox: Record<string, unknown> = {
    shape: pres.ShapeType.rect,
    x: 0,
    y: 0,
    w: 0.08,
    h: 0.5,
    fill: { color: COLORS.primary },
    line: { type: "none" },
  };
  slide.addShape(titleBox);
  
  // Module context
  slide.addText(moduleTitle, {
    x: SLIDE_CONFIG.contentMargin,
    y: 0.08,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.25,
    fontSize: FONTS.small,
    color: COLORS.lightText,
    fontFace: "Segoe UI",
  });
  
  // Lesson title
  slide.addText(lesson.title, {
    x: SLIDE_CONFIG.contentMargin,
    y: 0.35,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.6,
    fontSize: FONTS.heading,
    bold: true,
    color: COLORS.primary,
    wrap: true,
    fontFace: "Segoe UI",
  });
  
  // Format and duration badge
  const formatLabel = lesson.format.charAt(0).toUpperCase() + lesson.format.slice(1).replace(/-/g, " ");
  const metaY = 1.05;
  
  slide.addText(`${formatLabel} • ${formatDuration(lesson.durationMinutes)}`, {
    x: SLIDE_CONFIG.contentMargin,
    y: metaY,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.25,
    fontSize: FONTS.small,
    color: COLORS.primary,
    bold: true,
    fontFace: "Segoe UI",
  });
  
  // Objectives
  if (lesson.objectives && lesson.objectives.length > 0) {
    slide.addText("Objectives", {
      x: SLIDE_CONFIG.contentMargin,
      y: 1.45,
      w: 1.5,
      h: 0.25,
      fontSize: FONTS.body,
      bold: true,
      color: COLORS.text,
      fontFace: "Segoe UI",
    });
    
    let objY = 1.75;
    lesson.objectives.slice(0, 2).forEach((obj) => {
      slide.addText("•", {
        x: SLIDE_CONFIG.contentMargin,
        y: objY,
        w: 0.2,
        h: 0.2,
        fontSize: FONTS.small,
        color: COLORS.primary,
        bold: true,
        fontFace: "Segoe UI",
      });
      
      slide.addText(obj, {
        x: SLIDE_CONFIG.contentMargin + 0.25,
        y: objY,
        w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2 - 0.25,
        h: 0.2,
        fontSize: FONTS.small,
        color: COLORS.text,
        wrap: true,
        fontFace: "Segoe UI",
      });
      
      objY += 0.25;
    });
  }
  
  // Key Points
  if (lesson.keyPoints && lesson.keyPoints.length > 0) {
    const keyPointsY = lesson.objectives ? 2.35 : 1.45;
    
    slide.addText("Key Points", {
      x: SLIDE_CONFIG.contentMargin,
      y: keyPointsY,
      w: 1.5,
      h: 0.25,
      fontSize: FONTS.body,
      bold: true,
      color: COLORS.text,
      fontFace: "Segoe UI",
    });
    
    let pointY = keyPointsY + 0.3;
    lesson.keyPoints.slice(0, 3).forEach((point) => {
      slide.addText("•", {
        x: SLIDE_CONFIG.contentMargin,
        y: pointY,
        w: 0.2,
        h: 0.2,
        fontSize: FONTS.small,
        color: COLORS.primary,
        bold: true,
        fontFace: "Segoe UI",
      });
      
      slide.addText(point, {
        x: SLIDE_CONFIG.contentMargin + 0.25,
        y: pointY,
        w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2 - 0.25,
        h: 0.2,
        fontSize: FONTS.small,
        color: COLORS.text,
        wrap: true,
        fontFace: "Segoe UI",
      });
      
      pointY += 0.25;
    });
  }
  
  // Suggested Resources
  if (lesson.suggestedResources && lesson.suggestedResources.length > 0) {
    const resourcesY = 4;
    
    slide.addText("Resources", {
      x: SLIDE_CONFIG.contentMargin,
      y: resourcesY,
      w: 1.5,
      h: 0.25,
      fontSize: FONTS.body,
      bold: true,
      color: COLORS.text,
      fontFace: "Segoe UI",
    });
    
    let resY = resourcesY + 0.3;
    lesson.suggestedResources.slice(0, 2).forEach((res) => {
      slide.addText(`${res.type}: ${res.title}`, {
        x: SLIDE_CONFIG.contentMargin + 0.2,
        y: resY,
        w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2 - 0.2,
        h: 0.18,
        fontSize: FONTS.tiny,
        color: COLORS.lightText,
        italic: true,
        wrap: true,
        fontFace: "Segoe UI",
      });
      
      resY += 0.22;
    });
  }
}

/**
 * Quiz slide for module or lesson
 */
function addQuizSlide(pres: PptxGenJS, title: string, questions: any[]) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };
  addAccentBar(pres);
  
  // Title bar accent
  const titleBox: Record<string, unknown> = {
    shape: pres.ShapeType.rect,
    x: 0,
    y: 0,
    w: 0.08,
    h: 0.5,
    fill: { color: COLORS.primary },
    line: { type: "none" },
  };
  slide.addShape(titleBox);
  
  slide.addText(`${title} Assessment`, {
    x: SLIDE_CONFIG.contentMargin,
    y: 0.08,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.5,
    fontSize: FONTS.heading,
    bold: true,
    color: COLORS.primary,
    fontFace: "Segoe UI",
  });
  
  let currentY = 0.75;
  const maxQuestions = 3;
  
  questions.slice(0, maxQuestions).forEach((question, idx) => {
    // Question number and text
    slide.addText(`${idx + 1}. ${question.question}`, {
      x: SLIDE_CONFIG.contentMargin,
      y: currentY,
      w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
      h: 0.35,
      fontSize: FONTS.small,
      bold: true,
      color: COLORS.text,
      wrap: true,
      fontFace: "Segoe UI",
    });
    
    currentY += 0.4;
    
    // Options or answer
    if (question.options && question.options.length > 0) {
      question.options.slice(0, 3).forEach((option: string) => {
        const isCorrect = question.options[question.correctAnswer] === option;
        const textColor = isCorrect ? COLORS.primary : COLORS.lightText;
        const prefix = isCorrect ? "✓ " : "○ ";
        
        slide.addText(prefix + option, {
          x: SLIDE_CONFIG.contentMargin + 0.3,
          y: currentY,
          w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2 - 0.3,
          h: 0.22,
          fontSize: FONTS.tiny,
          color: textColor,
          wrap: true,
          fontFace: "Segoe UI",
        });
        
        currentY += 0.25;
      });
    } else {
      slide.addText(`Answer: ${question.correctAnswer}`, {
        x: SLIDE_CONFIG.contentMargin + 0.3,
        y: currentY,
        w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2 - 0.3,
        h: 0.22,
        fontSize: FONTS.tiny,
        color: COLORS.primary,
        bold: true,
        fontFace: "Segoe UI",
      });
      
      currentY += 0.25;
    }
    
    currentY += 0.15;
  });
}

/**
 * Pacing Schedule slide
 */
function addPacingSlide(pres: PptxGenJS, curriculum: Curriculum) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };
  addAccentBar(pres);
  
  // Title
  const titleBox: Record<string, unknown> = {
    shape: pres.ShapeType.rect,
    x: 0,
    y: 0,
    w: 0.08,
    h: 0.5,
    fill: { color: COLORS.primary },
    line: { type: "none" },
  };
  slide.addShape(titleBox);
  
  slide.addText("Pacing Schedule", {
    x: SLIDE_CONFIG.contentMargin,
    y: 0.08,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.5,
    fontSize: FONTS.heading,
    bold: true,
    color: COLORS.primary,
    fontFace: "Segoe UI",
  });
  
  // Pacing info
  const infoY = 0.75;
  const infoGap = 0.5;
  
  const pacingInfo = [
    `Style: ${curriculum.pacing.style}`,
    `Total Duration: ${curriculum.pacing.totalHours} hours`,
    `Hours per Week: ${curriculum.pacing.hoursPerWeek}h`,
    `Recommended Duration: ${curriculum.pacing.totalWeeks} weeks`,
  ];
  
  pacingInfo.forEach((info, idx) => {
    slide.addText(info, {
      x: SLIDE_CONFIG.contentMargin,
      y: infoY + idx * infoGap,
      w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
      h: 0.3,
      fontSize: FONTS.body,
      color: COLORS.text,
      fontFace: "Segoe UI",
    });
  });
  
  // Weekly breakdown if available
  if (curriculum.pacing.weeklyPlan && curriculum.pacing.weeklyPlan.length > 0) {
    slide.addText("Weekly Plan", {
      x: SLIDE_CONFIG.contentMargin,
      y: 2.7,
      w: 1.5,
      h: 0.3,
      fontSize: FONTS.body,
      bold: true,
      color: COLORS.primary,
      fontFace: "Segoe UI",
    });
    
    let weekY = 3.1;
    curriculum.pacing.weeklyPlan.slice(0, 3).forEach((week) => {
      const modules = curriculum.modules
        .filter((m) => week.moduleIds.includes(m.id))
        .map((m) => m.title)
        .join(", ");
      
      slide.addText(`Week ${week.week}: ${week.label || ""} - ${modules}`, {
        x: SLIDE_CONFIG.contentMargin + 0.2,
        y: weekY,
        w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2 - 0.2,
        h: 0.35,
        fontSize: FONTS.small,
        color: COLORS.text,
        wrap: true,
        fontFace: "Segoe UI",
      });
      
      weekY += 0.4;
    });
  }
}

/**
 * Bonus Resources slide
 */
function addResourcesSlide(pres: PptxGenJS, curriculum: Curriculum) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.white };
  addAccentBar(pres);
  
  // Title
  const titleBox: Record<string, unknown> = {
    shape: pres.ShapeType.rect,
    x: 0,
    y: 0,
    w: 0.08,
    h: 0.5,
    fill: { color: COLORS.primary },
    line: { type: "none" },
  };
  slide.addShape(titleBox);
  
  slide.addText("Bonus Resources", {
    x: SLIDE_CONFIG.contentMargin,
    y: 0.08,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin,
    h: 0.5,
    fontSize: FONTS.heading,
    bold: true,
    color: COLORS.primary,
    fontFace: "Segoe UI",
  });
  
  let resourceY = 0.8;
  const resources = curriculum.bonusResources || [];
  
  resources.slice(0, 6).forEach((resource) => {
    const badge = resource.isFree ? "(Free)" : "(Paid)";
    const duration = resource.durationMinutes ? ` • ${formatDuration(resource.durationMinutes)}` : "";
    
    slide.addText(`${resource.type.toUpperCase()} ${badge}`, {
      x: SLIDE_CONFIG.contentMargin,
      y: resourceY,
      w: 2,
      h: 0.22,
      fontSize: FONTS.tiny,
      color: COLORS.primary,
      bold: true,
      fontFace: "Segoe UI",
    });
    
    slide.addText(`${resource.title}${duration}`, {
      x: SLIDE_CONFIG.contentMargin,
      y: resourceY + 0.24,
      w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2,
      h: 0.25,
      fontSize: FONTS.small,
      color: COLORS.text,
      wrap: true,
      fontFace: "Segoe UI",
    });
    
    if (resource.description) {
      slide.addText(resource.description, {
        x: SLIDE_CONFIG.contentMargin,
        y: resourceY + 0.5,
        w: SLIDE_CONFIG.width - SLIDE_CONFIG.contentMargin * 2,
        h: 0.25,
        fontSize: FONTS.tiny,
        color: COLORS.lightText,
        italic: true,
        wrap: true,
        fontFace: "Segoe UI",
      });
      
      resourceY += 0.8;
    } else {
      resourceY += 0.55;
    }
  });
}

/**
 * Certificate / Thank You slide
 */
function addCertificateSlide(pres: PptxGenJS, curriculum: Curriculum) {
  const slide = pres.addSlide();
  slide.background = { color: COLORS.bg };
  
  // Decorative circles
  addAccentCircle(pres, -0.2, 0.5, 1, COLORS.light);
  addAccentCircle(pres, SLIDE_CONFIG.width - 0.4, SLIDE_CONFIG.height - 1, 0.9, COLORS.light);
  
  // Certificate box
  const certBox: Record<string, unknown> = {
    shape: pres.ShapeType.roundRect,
    x: SLIDE_CONFIG.contentMargin + 0.5,
    y: 0.6,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin - 1,
    h: 3.5,
    fill: { color: COLORS.white },
    line: { color: COLORS.primary, pt: 3 },
  };
  slide.addShape(certBox);
  
  // Certificate title
  slide.addText("Certificate of Completion", {
    x: SLIDE_CONFIG.contentMargin + 1,
    y: 0.9,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin - 2,
    h: 0.5,
    fontSize: FONTS.heading,
    bold: true,
    color: COLORS.primary,
    align: "center",
    fontFace: "Segoe UI",
  });
  
  slide.addText(curriculum.title, {
    x: SLIDE_CONFIG.contentMargin + 1,
    y: 1.5,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin - 2,
    h: 0.6,
    fontSize: FONTS.title,
    bold: true,
    color: COLORS.primary,
    align: "center",
    wrap: true,
    fontFace: "Segoe UI",
  });
  
  // Stats
  const totalLessons = curriculum.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const statsText = `You completed ${curriculum.modules.length} modules, ${totalLessons} lessons, and ${curriculum.pacing.totalHours} hours of content.`;
  
  slide.addText(statsText, {
    x: SLIDE_CONFIG.contentMargin + 1,
    y: 2.3,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin - 2,
    h: 0.8,
    fontSize: FONTS.small,
    color: COLORS.text,
    align: "center",
    wrap: true,
    fontFace: "Segoe UI",
  });
  
  // Congratulations
  slide.addText("Congratulations on your achievement!", {
    x: SLIDE_CONFIG.contentMargin + 1,
    y: 3.3,
    w: SLIDE_CONFIG.width - 2 * SLIDE_CONFIG.contentMargin - 2,
    h: 0.4,
    fontSize: FONTS.body,
    bold: true,
    color: COLORS.primary,
    align: "center",
    fontFace: "Segoe UI",
  });
  
  addAccentBar(pres);
}

// ─────────────────────────────────────────────────────────
// Main Export Function
// ─────────────────────────────────────────────────────────

/**
 * Generate a premium PowerPoint presentation from a Curriculum object
 * @param curriculum - The curriculum data to convert to slides
 * @returns A Blob containing the PPTX file
 */
export async function generateCurriculumPptx(curriculum: Curriculum): Promise<Blob> {
  const pres = new PptxGenJS();
  
  // Set presentation properties
  pres.defineLayout({ name: "LAYOUT1", width: SLIDE_CONFIG.width, height: SLIDE_CONFIG.height });
  pres.layout = "LAYOUT1";
  
  // Add slides
  addTitleSlide(pres, curriculum);
  addOverviewSlide(pres, curriculum);
  addRoadmapSlide(pres, curriculum);
  
  // Add module and lesson slides
  curriculum.modules.forEach((module) => {
    addModuleSlide(pres, module, module.order);
    
    module.lessons.forEach((lesson) => {
      addLessonSlide(pres, lesson, module.title);
      
      // Add quiz if present
      if (lesson.quiz && lesson.quiz.length > 0) {
        addQuizSlide(pres, lesson.title, lesson.quiz);
      }
    });
    
    // Add module-level quiz if present
    if (module.quiz && module.quiz.length > 0) {
      addQuizSlide(pres, module.title, module.quiz);
    }
  });
  
  // Add additional slides
  addPacingSlide(pres, curriculum);
  
  if (curriculum.bonusResources && curriculum.bonusResources.length > 0) {
    addResourcesSlide(pres, curriculum);
  }
  
  addCertificateSlide(pres, curriculum);
  
  // Generate and return blob
  const blob = await pres.write({ outputType: "blob" }) as Blob;
  return blob;
}
