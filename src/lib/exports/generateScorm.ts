import JSZip from "jszip";
import {
  Curriculum,
  Module,
  Lesson,
  QuizQuestion,
  TeachingStyle,
} from "@/types/curriculum";

/**
 * Style configuration record keyed by TeachingStyle. Each entry drives the
 * colors, fonts, and module-vocabulary used throughout the SCORM HTML pages.
 */
export interface ScormStyleConfig {
  primary: string;
  primaryDark: string;
  accent: string;
  bgTint: string;
  bgTint2: string;
  gradientFrom: string;
  gradientTo: string;
  fontFamily: string;
  moduleWord: "Module" | "Chapter" | "Session";
  moduleEmoji: string;
}

export const SCORM_STYLE_CONFIG: Record<TeachingStyle, ScormStyleConfig> = {
  conversational: {
    primary: "#6D28D9",
    primaryDark: "#4C1D95",
    accent: "#A78BFA",
    bgTint: "#f9f8ff",
    bgTint2: "#f3f0ff",
    gradientFrom: "#6D28D9",
    gradientTo: "#7c3aed",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    moduleWord: "Module",
    moduleEmoji: "📕",
  },
  academic: {
    primary: "#1E3A8A",
    primaryDark: "#0F172A",
    accent: "#94A3B8",
    bgTint: "#f8fafc",
    bgTint2: "#f1f5f9",
    gradientFrom: "#1E3A8A",
    gradientTo: "#3B82F6",
    fontFamily: "'Georgia', 'Times New Roman', Cambria, serif",
    moduleWord: "Chapter",
    moduleEmoji: "📜",
  },
  "hands-on": {
    primary: "#047857",
    primaryDark: "#064E3B",
    accent: "#D97706",
    bgTint: "#f0fdf4",
    bgTint2: "#ecfdf5",
    gradientFrom: "#047857",
    gradientTo: "#10B981",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    moduleWord: "Session",
    moduleEmoji: "🔨",
  },
  storytelling: {
    primary: "#9F1239",
    primaryDark: "#4C0519",
    accent: "#F59E0B",
    bgTint: "#fff1f2",
    bgTint2: "#ffe4e6",
    gradientFrom: "#9F1239",
    gradientTo: "#E11D48",
    fontFamily: "'Georgia', 'Times New Roman', Cambria, serif",
    moduleWord: "Chapter",
    moduleEmoji: "✨",
  },
};

const DEFAULT_STYLE: TeachingStyle = "conversational";

/**
 * Returns a `<style>` block defining CSS custom properties for the selected
 * teaching style. Injected into every generated HTML page so that class-level
 * rules in `getGlobalStyles()` can reference `var(--primary)` etc.
 */
function getThemeCss(style: TeachingStyle): string {
  const cfg = SCORM_STYLE_CONFIG[style];
  return `:root {
      --primary: ${cfg.primary};
      --primary-dark: ${cfg.primaryDark};
      --accent: ${cfg.accent};
      --bg-tint: ${cfg.bgTint};
      --bg-tint-2: ${cfg.bgTint2};
      --gradient-from: ${cfg.gradientFrom};
      --gradient-to: ${cfg.gradientTo};
      --font-family: ${cfg.fontFamily};
    }`;
}

/**
 * Strips any stale "Module 1:"/"Chapter 2 -"/"Session 3." prefix from a module
 * title so the configured moduleWord can be re-applied consistently.
 */
function stripModulePrefix(title: string): string {
  return title.replace(
    /^(?:module|chapter|session|unit)\s*\d+\s*[:.\-]\s*/i,
    ""
  );
}

/**
 * Generates a SCORM 1.2 package (.zip) from a Curriculum object.
 * Compatible with Moodle, Canvas, and other SCORM-compliant LMS platforms.
 */
export async function generateScormPackage(
  curriculum: Curriculum,
  opts?: { teachingStyle?: TeachingStyle | null }
): Promise<Blob> {
  const style: TeachingStyle = opts?.teachingStyle ?? DEFAULT_STYLE;
  const zip = new JSZip();

  // Generate manifest
  const manifest = generateManifest(curriculum, style);
  zip.file("imsmanifest.xml", manifest);

  // Generate SCORM API wrapper
  zip.file("scorm_api.js", generateScormApiWrapper());

  // Generate module overview pages
  for (const module of curriculum.modules) {
    const moduleHtml = generateModuleOverviewPage(curriculum, module, style);
    zip.file(`module_${module.id}.html`, moduleHtml);
  }

  // Generate lesson pages
  for (const module of curriculum.modules) {
    for (const lesson of module.lessons) {
      const lessonHtml = generateLessonPage(curriculum, module, lesson, style);
      zip.file(`lesson_${lesson.id}.html`, lessonHtml);
    }
  }

  // Generate quiz pages
  for (const module of curriculum.modules) {
    if (module.quiz && module.quiz.length > 0) {
      const quizHtml = generateQuizPage(
        curriculum,
        module,
        null,
        module.quiz,
        style
      );
      zip.file(`quiz_module_${module.id}.html`, quizHtml);
    }

    for (const lesson of module.lessons) {
      if (lesson.quiz && lesson.quiz.length > 0) {
        const quizHtml = generateQuizPage(
          curriculum,
          module,
          lesson,
          lesson.quiz,
          style
        );
        zip.file(`quiz_lesson_${lesson.id}.html`, quizHtml);
      }
    }
  }

  // Generate course overview (index)
  const courseHtml = generateCourseOverviewPage(curriculum, style);
  zip.file("index.html", courseHtml);

  // Generate the blob
  return zip.generateAsync({ type: "blob" });
}

/**
 * Generates the imsmanifest.xml file that describes the SCORM package structure.
 */
function generateManifest(curriculum: Curriculum, style: TeachingStyle): string {
  const cfg = SCORM_STYLE_CONFIG[style];
  const courseId = sanitizeId(curriculum.id);
  const orgId = `org_${courseId}`;

  // Build organization items
  let organizationContent = `    <organization identifier="${orgId}" structure="hierarchical">
      <title>${escapeXml(curriculum.title)}</title>
      <item identifier="item_index" identifierref="res_index">
        <title>Course Overview</title>
      </item>`;

  // Module items
  for (const module of curriculum.modules) {
    const moduleId = sanitizeId(module.id);
    const cleanModuleTitle = stripModulePrefix(module.title);
    const labelledTitle = `${cfg.moduleWord} ${module.order + 1}: ${cleanModuleTitle}`;
    organizationContent += `
      <item identifier="item_module_${moduleId}" identifierref="res_module_${moduleId}">
        <title>${escapeXml(labelledTitle)}</title>`;

    // Lesson items
    for (const lesson of module.lessons) {
      const lessonId = sanitizeId(lesson.id);
      organizationContent += `
        <item identifier="item_lesson_${lessonId}" identifierref="res_lesson_${lessonId}">
          <title>${escapeXml(lesson.title)}</title>
        </item>`;
    }

    // Module quiz item
    if (module.quiz && module.quiz.length > 0) {
      organizationContent += `
        <item identifier="item_quiz_module_${moduleId}" identifierref="res_quiz_module_${moduleId}">
          <title>${escapeXml(labelledTitle)} - Quiz</title>
        </item>`;
    }

    organizationContent += `
      </item>`;
  }

  organizationContent += `
    </organization>`;

  // Build resources section
  let resourcesContent = `    <resource identifier="res_index" type="webcontent" href="index.html">
      <file href="index.html"/>
      <file href="scorm_api.js"/>
    </resource>`;

  for (const module of curriculum.modules) {
    const moduleId = sanitizeId(module.id);
    resourcesContent += `
    <resource identifier="res_module_${moduleId}" type="webcontent" href="module_${moduleId}.html">
      <file href="module_${moduleId}.html"/>
      <file href="scorm_api.js"/>
    </resource>`;

    for (const lesson of module.lessons) {
      const lessonId = sanitizeId(lesson.id);
      resourcesContent += `
    <resource identifier="res_lesson_${lessonId}" type="webcontent" href="lesson_${lessonId}.html">
      <file href="lesson_${lessonId}.html"/>
      <file href="scorm_api.js"/>
    </resource>`;
    }

    if (module.quiz && module.quiz.length > 0) {
      const moduleId = sanitizeId(module.id);
      resourcesContent += `
    <resource identifier="res_quiz_module_${moduleId}" type="webcontent" href="quiz_module_${moduleId}.html">
      <file href="quiz_module_${moduleId}.html"/>
      <file href="scorm_api.js"/>
    </resource>`;
    }
  }

  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="manifest_${courseId}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
    http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
    <adlcp:location>imsmanifest.xml</adlcp:location>
  </metadata>
${organizationContent}
  <resources>
${resourcesContent}
  </resources>
</manifest>`;

  return manifest;
}

/**
 * Generates the course overview/index page.
 */
function generateCourseOverviewPage(
  curriculum: Curriculum,
  style: TeachingStyle
): string {
  const cfg = SCORM_STYLE_CONFIG[style];
  const totalLessons = curriculum.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(curriculum.title)}</title>
  <style>${getThemeCss(style)}${getGlobalStyles()}</style>
</head>
<body onload="scormInit()">
  <div class="container">
    <header class="header">
      <div class="header-content">
        <h1>${escapeHtml(curriculum.title)}</h1>
        <p class="subtitle">${escapeHtml(curriculum.subtitle)}</p>
      </div>
    </header>

    <main class="main">
      <section class="welcome-section">
        <h2>Welcome to this Course</h2>
        <p>${escapeHtml(curriculum.description)}</p>
      </section>

      <section class="info-grid">
        <div class="info-card">
          <div class="info-number">${curriculum.modules.length}</div>
          <div class="info-label">${cfg.moduleWord}s</div>
        </div>
        <div class="info-card">
          <div class="info-number">${totalLessons}</div>
          <div class="info-label">Lessons</div>
        </div>
        <div class="info-card">
          <div class="info-number">${curriculum.pacing.totalHours}</div>
          <div class="info-label">Hours</div>
        </div>
        <div class="info-card">
          <div class="info-number">${escapeHtml(curriculum.difficulty)}</div>
          <div class="info-label">Level</div>
        </div>
      </section>

      <section class="objectives-section">
        <h2>Learning Objectives</h2>
        <ul class="objectives-list">
          ${curriculum.objectives.map((obj) => `<li>${escapeHtml(obj)}</li>`).join("\n          ")}
        </ul>
      </section>

      ${curriculum.prerequisites && curriculum.prerequisites.length > 0 ? `
      <section class="prerequisites-section">
        <h2>Prerequisites</h2>
        <ul class="prerequisites-list">
          ${curriculum.prerequisites.map((prereq) => `<li>${escapeHtml(prereq)}</li>`).join("\n          ")}
        </ul>
      </section>` : ""}

      <section class="audience-section">
        <h2>Target Audience</h2>
        <p>${escapeHtml(curriculum.targetAudience)}</p>
      </section>

      <section class="course-content">
        <h2>Course Content</h2>
        <div class="modules-list">
          ${curriculum.modules
            .map((module) => generateModuleListItem(module, style))
            .join("\n          ")}
        </div>
      </section>

      <section class="getting-started">
        <h2>Getting Started</h2>
        <p>Click on any ${cfg.moduleWord.toLowerCase()} below to begin learning. Each lesson includes content, key points, and interactive elements. Complete all lessons in a ${cfg.moduleWord.toLowerCase()} to mark it as done.</p>
        <a href="module_${sanitizeId(curriculum.modules[0]?.id || "")}.html" class="cta-button">Start First ${cfg.moduleWord}</a>
      </section>
    </main>

    <footer class="footer">
      <p>&copy; ${new Date().getFullYear()} Course Materials. All rights reserved.</p>
    </footer>
  </div>

  <script src="scorm_api.js"></script>
  <script>
    function scormInit() {
      var lms = scormFindLms();
      if (lms) {
        var result = lms.LMSInitialize("");
        if (result == "true") {
          lms.LMSSetValue("cmi.core.lesson_status", "started");
          lms.LMSCommit("");
        }
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Generates a module overview page.
 */
function generateModuleOverviewPage(
  curriculum: Curriculum,
  module: Module,
  style: TeachingStyle
): string {
  const cfg = SCORM_STYLE_CONFIG[style];
  const moduleId = sanitizeId(module.id);
  const firstLessonId = module.lessons[0]?.id || "";
  const cleanTitle = stripModulePrefix(module.title);
  const labelledTitle = `${cfg.moduleWord} ${module.order + 1}: ${cleanTitle}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(labelledTitle)}</title>
  <style>${getThemeCss(style)}${getGlobalStyles()}</style>
</head>
<body onload="scormInit()">
  <div class="container">
    <header class="header">
      <a href="index.html" class="breadcrumb">&larr; ${escapeHtml(curriculum.title)}</a>
      <h1>${cfg.moduleEmoji} ${escapeHtml(labelledTitle)}</h1>
    </header>

    <main class="main">
      <section class="module-overview">
        <p class="module-description">${escapeHtml(module.description)}</p>

        <div class="module-meta">
          <span class="meta-item">
            <strong>${module.lessons.length}</strong> lessons
          </span>
          <span class="meta-item">
            <strong>${module.durationMinutes}</strong> minutes
          </span>
        </div>
      </section>

      <section class="objectives-section">
        <h2>${cfg.moduleWord} Objectives</h2>
        <ul class="objectives-list">
          ${module.objectives.map((obj) => `<li>${escapeHtml(obj)}</li>`).join("\n          ")}
        </ul>
      </section>

      <section class="lessons-section">
        <h2>Lessons</h2>
        <div class="lessons-grid">
          ${module.lessons
            .map((lesson) => generateLessonCard(lesson))
            .join("\n          ")}
        </div>
      </section>

      ${module.quiz && module.quiz.length > 0 ? `
      <section class="quiz-section">
        <h2>${cfg.moduleWord} Assessment</h2>
        <p>Test your understanding of this ${cfg.moduleWord.toLowerCase()}'s content.</p>
        <a href="quiz_module_${moduleId}.html" class="cta-button">Take Quiz</a>
      </section>` : ""}

      <section class="navigation">
        <a href="index.html" class="btn btn-secondary">Back to Course</a>
        <a href="lesson_${sanitizeId(firstLessonId)}.html" class="btn btn-primary">Start Learning</a>
      </section>
    </main>

    <footer class="footer">
      <p>&copy; ${new Date().getFullYear()} Course Materials. All rights reserved.</p>
    </footer>
  </div>

  <script src="scorm_api.js"></script>
  <script>
    function scormInit() {
      var lms = scormFindLms();
      if (lms) {
        var result = lms.LMSInitialize("");
        if (result == "true") {
          lms.LMSSetValue("cmi.core.lesson_status", "started");
          lms.LMSSetValue("cmi.core.lesson_location", "module_${moduleId}");
          lms.LMSCommit("");
        }
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Generates a lesson page.
 */
function generateLessonPage(
  curriculum: Curriculum,
  module: Module,
  lesson: Lesson,
  style: TeachingStyle
): string {
  const cfg = SCORM_STYLE_CONFIG[style];
  const lessonId = sanitizeId(lesson.id);
  const moduleId = sanitizeId(module.id);
  const nextLesson = module.lessons[lesson.order + 1];
  const cleanModuleTitle = stripModulePrefix(module.title);
  const labelledModuleTitle = `${cfg.moduleWord} ${module.order + 1}: ${cleanModuleTitle}`;

  // Avoid unused variable warnings when curriculum is unused here.
  void curriculum;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(lesson.title)}</title>
  <style>${getThemeCss(style)}${getGlobalStyles()}</style>
</head>
<body onload="scormInit()">
  <div class="container">
    <header class="header">
      <a href="module_${moduleId}.html" class="breadcrumb">&larr; ${escapeHtml(labelledModuleTitle)}</a>
      <h1>${escapeHtml(lesson.title)}</h1>
    </header>

    <main class="main">
      <section class="lesson-info">
        <p class="lesson-description">${escapeHtml(lesson.description)}</p>
        <div class="lesson-meta">
          <span class="meta-badge">${escapeHtml(lesson.format)}</span>
          <span class="meta-item">${lesson.durationMinutes} min</span>
        </div>
      </section>

      ${lesson.objectives && lesson.objectives.length > 0 ? `
      <section class="objectives-section">
        <h2>Lesson Objectives</h2>
        <ul class="objectives-list">
          ${lesson.objectives.map((obj) => `<li>${escapeHtml(obj)}</li>`).join("\n          ")}
        </ul>
      </section>` : ""}

      <section class="lesson-content">
        ${lesson.content ? `<div class="content-body">${markdownToHtml(lesson.content)}</div>` : "<p>No content available for this lesson.</p>"}
      </section>

      ${lesson.keyPoints && lesson.keyPoints.length > 0 ? `
      <section class="key-points">
        <h2>Key Takeaways</h2>
        <ul class="key-points-list">
          ${lesson.keyPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("\n          ")}
        </ul>
      </section>` : ""}

      ${lesson.suggestedResources && lesson.suggestedResources.length > 0 ? `
      <section class="resources-section">
        <h2>Suggested Resources</h2>
        <ul class="resources-list">
          ${lesson.suggestedResources.map((res) => `<li><a href="${escapeHtml(res.url)}" target="_blank">${escapeHtml(res.title)}</a> (${escapeHtml(res.type)})</li>`).join("\n          ")}
        </ul>
      </section>` : ""}

      ${lesson.quiz && lesson.quiz.length > 0 ? `
      <section class="quiz-section">
        <h2>Lesson Quiz</h2>
        <p>Test what you've learned in this lesson.</p>
        <a href="quiz_lesson_${lessonId}.html" class="cta-button">Take Quiz</a>
      </section>` : ""}

      <section class="navigation">
        <a href="module_${moduleId}.html" class="btn btn-secondary">Back to ${cfg.moduleWord}</a>
        ${nextLesson ? `<a href="lesson_${sanitizeId(nextLesson.id)}.html" class="btn btn-primary">Next Lesson</a>` : `<a href="module_${moduleId}.html" class="btn btn-primary">${cfg.moduleWord} Complete</a>`}
      </section>
    </main>

    <footer class="footer">
      <p>&copy; ${new Date().getFullYear()} Course Materials. All rights reserved.</p>
    </footer>
  </div>

  <script src="scorm_api.js"></script>
  <script>
    function scormInit() {
      var lms = scormFindLms();
      if (lms) {
        var result = lms.LMSInitialize("");
        if (result == "true") {
          lms.LMSSetValue("cmi.core.lesson_status", "started");
          lms.LMSSetValue("cmi.core.lesson_location", "lesson_${lessonId}");
          lms.LMSSetValue("cmi.core.score.raw", "0");
          lms.LMSCommit("");
        }
      }
    }

    window.addEventListener("beforeunload", function() {
      var lms = scormFindLms();
      if (lms) {
        lms.LMSSetValue("cmi.core.lesson_status", "completed");
        lms.LMSCommit("");
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Generates a quiz page with interactive question-and-answer elements.
 */
function generateQuizPage(
  curriculum: Curriculum,
  module: Module | null,
  lesson: Lesson | null,
  questions: QuizQuestion[],
  style: TeachingStyle
): string {
  const cfg = SCORM_STYLE_CONFIG[style];
  void curriculum;
  const moduleLabel = module
    ? `${cfg.moduleWord} ${module.order + 1}: ${stripModulePrefix(module.title)}`
    : "";
  const pageTitle = lesson
    ? escapeHtml(lesson.title)
    : module
      ? escapeHtml(moduleLabel)
      : "Quiz";
  const backLink =
    lesson && module
      ? `lesson_${sanitizeId(lesson.id)}.html`
      : module
        ? `module_${sanitizeId(module.id)}.html`
        : "index.html";
  const backText = lesson && module ? "Lesson" : module ? cfg.moduleWord : "Course";

  const questionsHtml = questions
    .map((q, idx) => generateQuestionElement(q, idx))
    .join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz: ${pageTitle}</title>
  <style>
    ${getThemeCss(style)}
    ${getGlobalStyles()}
    .quiz-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .question {
      background: var(--bg-tint);
      border-left: 4px solid var(--primary);
      padding: 24px;
      margin-bottom: 24px;
      border-radius: 8px;
    }
    .question-number {
      font-size: 14px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .question-text {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
    }
    .options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .option {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: white;
      border: 2px solid var(--bg-tint-2);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .option:hover {
      border-color: var(--primary);
      background: var(--bg-tint);
    }
    .option input[type="radio"],
    .option input[type="checkbox"] {
      margin-top: 4px;
      cursor: pointer;
    }
    .option label {
      cursor: pointer;
      flex: 1;
      color: #333;
    }
    .answer-reveal {
      margin-top: 16px;
      padding: 16px;
      background: #f0f9ff;
      border-left: 4px solid #0284c7;
      border-radius: 4px;
      display: none;
      animation: slideIn 0.3s ease;
    }
    .answer-reveal.show {
      display: block;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .answer-reveal h4 {
      margin: 0 0 8px 0;
      color: #0284c7;
      font-size: 14px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .answer-reveal p {
      margin: 0;
      color: #333;
      font-size: 14px;
    }
    .correct {
      color: #16a34a;
      font-weight: 600;
    }
    .submit-btn {
      background-color: var(--primary);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
      margin-top: 24px;
    }
    .submit-btn:hover {
      background-color: var(--primary-dark);
    }
    .quiz-results {
      background: #f0fdf4;
      border: 2px solid #16a34a;
      border-radius: 8px;
      padding: 24px;
      margin-top: 24px;
      display: none;
    }
    .quiz-results.show {
      display: block;
    }
    .score-display {
      font-size: 36px;
      font-weight: 700;
      color: #16a34a;
      text-align: center;
      margin-bottom: 16px;
    }
  </style>
</head>
<body onload="scormInit()">
  <div class="container">
    <header class="header">
      <a href="${backLink}" class="breadcrumb">&larr; Back to ${backText}</a>
      <h1>Quiz: ${pageTitle}</h1>
    </header>

    <main class="main">
      <section class="quiz-container">
        <form id="quizForm">
          ${questionsHtml}
          <button type="button" class="submit-btn" onclick="submitQuiz()">Submit Quiz</button>
        </form>

        <div id="quizResults" class="quiz-results">
          <div class="score-display" id="scoreDisplay"></div>
          <p id="scoreMessage" style="text-align: center; font-size: 18px;"></p>
        </div>
      </section>

      <section class="navigation" style="margin-top: 32px;">
        <a href="${backLink}" class="btn btn-secondary">Back to ${backText}</a>
      </section>
    </main>

    <footer class="footer">
      <p>&copy; ${new Date().getFullYear()} Course Materials. All rights reserved.</p>
    </footer>
  </div>

  <script src="scorm_api.js"></script>
  <script>
    const quizData = ${JSON.stringify(questions)};

    function scormInit() {
      var lms = scormFindLms();
      if (lms) {
        var result = lms.LMSInitialize("");
        if (result == "true") {
          lms.LMSSetValue("cmi.core.lesson_status", "browsed");
          lms.LMSCommit("");
        }
      }
    }

    function submitQuiz() {
      let score = 0;
      let totalPoints = 0;

      quizData.forEach((question, idx) => {
        const points = question.points || 1;
        totalPoints += points;

        if (question.type === "multiple-choice" || question.type === "true-false") {
          const selected = document.querySelector(
            'input[name="q' + idx + '"]:checked'
          );
          if (selected && parseInt(selected.value) === question.correctAnswer) {
            score += points;
          }
        } else if (question.type === "short-answer" || question.type === "fill-in-the-blank") {
          const input = document.querySelector('input[name="q' + idx + '"]');
          if (
            input &&
            input.value.toLowerCase().trim() ===
              String(question.correctAnswer).toLowerCase().trim()
          ) {
            score += points;
          }
        }
      });

      const percentage = Math.round((score / totalPoints) * 100);
      document.getElementById("scoreDisplay").textContent =
        percentage + "%";
      document.getElementById("scoreMessage").textContent =
        "You scored " + score + " out of " + totalPoints + " points.";
      document.getElementById("quizResults").classList.add("show");

      // Update SCORM score
      var lms = scormFindLms();
      if (lms) {
        lms.LMSSetValue("cmi.core.score.raw", String(percentage));
        lms.LMSSetValue(
          "cmi.core.lesson_status",
          percentage >= 70 ? "passed" : "failed"
        );
        lms.LMSCommit("");
      }

      // Scroll to results
      document.getElementById("quizResults").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // Reveal answer onclick
    document.addEventListener("click", function(e) {
      if (e.target.classList.contains("option")) {
        const reveal = e.target.closest(".question").querySelector(".answer-reveal");
        if (reveal && !reveal.classList.contains("show")) {
          reveal.classList.add("show");
        }
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Helper to generate a single question element in a quiz.
 */
function generateQuestionElement(question: QuizQuestion, index: number): string {
  const questionId = `q${index}`;
  const isMultipleChoice = question.type === "multiple-choice";
  const isTrueFalse = question.type === "true-false";
  const isShortAnswer =
    question.type === "short-answer" || question.type === "fill-in-the-blank";

  let optionsHtml = "";

  if (isMultipleChoice || isTrueFalse) {
    const inputType = "radio";
    optionsHtml = (question.options || [])
      .map(
        (option, idx) =>
          `<label class="option">
        <input type="${inputType}" name="${questionId}" value="${idx}" />
        <label>${escapeHtml(option)}</label>
      </label>`
      )
      .join("\n        ");
  } else if (isShortAnswer) {
    optionsHtml = `<input type="text" name="${questionId}" placeholder="Enter your answer..." style="padding: 10px; border: 2px solid var(--bg-tint-2); border-radius: 6px; font-size: 14px; width: 100%; box-sizing: border-box;" />`;
  }

  const explanationHtml = question.explanation
    ? `<div class="answer-reveal">
        <h4>Explanation</h4>
        <p>${escapeHtml(question.explanation)}</p>
      </div>`
    : "";

  return `<div class="question">
      <div class="question-number">Question ${index + 1}</div>
      <div class="question-text">${escapeHtml(question.question)}</div>
      <div class="options">${optionsHtml}</div>
      ${explanationHtml}
    </div>`;
}

/**
 * Helper to generate a lesson card for display in module overview.
 */
function generateLessonCard(lesson: Lesson): string {
  const lessonId = sanitizeId(lesson.id);
  return `<a href="lesson_${lessonId}.html" class="lesson-card">
        <h3>${escapeHtml(lesson.title)}</h3>
        <p>${escapeHtml(lesson.description)}</p>
        <div class="card-footer">
          <span class="format-badge">${escapeHtml(lesson.format)}</span>
          <span class="duration">${lesson.durationMinutes} min</span>
        </div>
      </a>`;
}

/**
 * Helper to generate a module list item for display on the course overview.
 */
function generateModuleListItem(module: Module, style: TeachingStyle): string {
  const cfg = SCORM_STYLE_CONFIG[style];
  const moduleId = sanitizeId(module.id);
  const cleanTitle = stripModulePrefix(module.title);
  const labelledTitle = `${cfg.moduleWord} ${module.order + 1}: ${cleanTitle}`;
  return `<a href="module_${moduleId}.html" class="module-item">
          <h3>${cfg.moduleEmoji} ${escapeHtml(labelledTitle)}</h3>
          <p>${escapeHtml(module.description)}</p>
          <div class="module-stats">
            <span>${module.lessons.length} lessons</span>
            <span>${module.durationMinutes} min</span>
          </div>
        </a>`;
}

/**
 * Returns the global CSS styles for all pages.
 */
function getGlobalStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-family);
      color: #1a1a1a;
      background-color: #ffffff;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, var(--gradient-from) 0%, var(--gradient-to) 100%);
      color: white;
      padding: 48px 32px;
      text-align: center;
    }

    .header h1 {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .header .subtitle {
      font-size: 20px;
      opacity: 0.95;
      font-weight: 500;
    }

    .breadcrumb {
      display: inline-block;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin-bottom: 16px;
      text-decoration: none;
      transition: opacity 0.2s;
    }

    .breadcrumb:hover {
      opacity: 0.7;
    }

    .main {
      flex: 1;
      padding: 48px 32px;
    }

    section {
      margin-bottom: 48px;
    }

    h2 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 24px;
      color: #1a1a1a;
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
    }

    p {
      font-size: 16px;
      line-height: 1.7;
      color: #333;
      margin-bottom: 16px;
    }

    ul, ol {
      margin-left: 24px;
      margin-bottom: 16px;
    }

    li {
      margin-bottom: 12px;
      font-size: 16px;
      color: #333;
    }

    a {
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    a:hover {
      color: var(--primary-dark);
    }

    .welcome-section {
      background: var(--bg-tint);
      padding: 32px;
      border-radius: 12px;
      border-left: 4px solid var(--primary);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .info-card {
      background: linear-gradient(135deg, var(--bg-tint) 0%, var(--bg-tint-2) 100%);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid var(--bg-tint-2);
      text-align: center;
    }

    .info-number {
      font-size: 36px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 8px;
    }

    .info-label {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .objectives-list {
      list-style: none;
      margin-left: 0;
    }

    .objectives-list li {
      padding: 12px 16px;
      background: var(--bg-tint);
      border-left: 3px solid var(--primary);
      margin-bottom: 12px;
      border-radius: 4px;
    }

    .modules-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .module-item {
      background: white;
      border: 2px solid var(--bg-tint-2);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
      display: block;
    }

    .module-item:hover {
      border-color: var(--primary);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      transform: translateY(-4px);
    }

    .module-item h3 {
      margin-bottom: 12px;
    }

    .module-item p {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
    }

    .module-stats {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #999;
    }

    .lessons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .lesson-card {
      background: white;
      border: 2px solid var(--bg-tint-2);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
      display: block;
      text-decoration: none;
    }

    .lesson-card:hover {
      border-color: var(--primary);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      transform: translateY(-4px);
    }

    .lesson-card h3 {
      margin-bottom: 8px;
      font-size: 18px;
    }

    .lesson-card p {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #999;
    }

    .format-badge, .meta-badge {
      background: var(--bg-tint-2);
      color: var(--primary);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .module-overview {
      background: var(--bg-tint);
      padding: 32px;
      border-radius: 12px;
      border-left: 4px solid var(--primary);
      margin-bottom: 32px;
    }

    .module-description {
      font-size: 18px;
      margin-bottom: 16px;
    }

    .module-meta, .lesson-meta {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #666;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .lesson-info {
      background: var(--bg-tint);
      padding: 24px;
      border-radius: 12px;
      border-left: 4px solid var(--primary);
      margin-bottom: 32px;
    }

    .lesson-description {
      font-size: 18px;
      margin-bottom: 16px;
    }

    .content-body {
      background: white;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid var(--bg-tint-2);
      margin-bottom: 32px;
      line-height: 1.8;
    }

    .content-body h3 {
      margin-top: 24px;
      margin-bottom: 12px;
    }

    .content-body h4 {
      margin-top: 20px;
      margin-bottom: 12px;
      font-size: 16px;
    }

    .content-body code {
      background: var(--bg-tint-2);
      padding: 2px 8px;
      border-radius: 4px;
      font-family: "Monaco", "Courier New", monospace;
      font-size: 14px;
      color: var(--primary);
    }

    .content-body pre {
      background: #1a1a1a;
      color: #e0e0e0;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
    }

    .content-body pre code {
      background: none;
      padding: 0;
      color: #e0e0e0;
    }

    .key-points {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 32px;
    }

    .key-points-list {
      list-style: none;
      margin-left: 0;
    }

    .key-points-list li {
      padding: 12px;
      background: white;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 15px;
    }

    .resources-section {
      background: #dbeafe;
      border-left: 4px solid #0284c7;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 32px;
    }

    .resources-list {
      list-style: none;
      margin-left: 0;
    }

    .resources-list li {
      padding: 12px;
      background: white;
      border-radius: 6px;
      margin-bottom: 12px;
    }

    .resources-list a {
      font-weight: 600;
    }

    .quiz-section {
      background: #f0f9ff;
      border-left: 4px solid #0284c7;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 32px;
    }

    .cta-button {
      display: inline-block;
      background-color: var(--primary);
      color: white;
      padding: 12px 32px;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      transition: background-color 0.2s ease;
      margin-top: 16px;
    }

    .cta-button:hover {
      background-color: var(--primary-dark);
    }

    .navigation {
      display: flex;
      gap: 16px;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid var(--bg-tint-2);
    }

    .btn {
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-block;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }

    .btn-primary {
      background-color: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
    }

    .btn-secondary {
      background-color: var(--bg-tint-2);
      color: var(--primary);
      border: 2px solid var(--bg-tint-2);
    }

    .btn-secondary:hover {
      background-color: var(--bg-tint);
      border-color: var(--primary);
    }

    .footer {
      background-color: #1a1a1a;
      color: #999;
      text-align: center;
      padding: 32px;
      font-size: 14px;
      margin-top: auto;
    }

    .getting-started {
      background: linear-gradient(135deg, var(--bg-tint) 0%, var(--bg-tint-2) 100%);
      padding: 32px;
      border-radius: 12px;
      text-align: center;
    }

    .getting-started h2 {
      margin-bottom: 16px;
    }

    .audience-section, .prerequisites-section {
      background: var(--bg-tint);
      padding: 24px;
      border-radius: 8px;
      border-left: 4px solid var(--accent);
    }

    @media (max-width: 768px) {
      .header {
        padding: 32px 16px;
      }

      .header h1 {
        font-size: 28px;
      }

      .main {
        padding: 24px 16px;
      }

      .modules-list, .lessons-grid {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .navigation {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        text-align: center;
      }
    }
  `;
}

/**
 * Generates a SCORM API wrapper that communicates with the LMS.
 */
function generateScormApiWrapper(): string {
  return `// ─────────────────────────────────────────────────────────
// SCORM 1.2 API Wrapper
// Finds and communicates with the LMS API
// ─────────────────────────────────────────────────────────

var API = null;
var API_1_3 = null;

/**
 * Finds the SCORM API in the window hierarchy.
 * Searches up through parent frames looking for the API object.
 */
function scormFindLms() {
  var windows = [window];
  var foundAPI = null;

  while (windows.length > 0) {
    var currentWindow = windows.shift();

    try {
      if (currentWindow.API) {
        foundAPI = currentWindow.API;
        API = foundAPI;
        return foundAPI;
      }

      if (currentWindow.API_1_3) {
        foundAPI = currentWindow.API_1_3;
        API_1_3 = foundAPI;
        return foundAPI;
      }

      // Try parent window
      if (currentWindow.parent && currentWindow.parent !== currentWindow) {
        windows.push(currentWindow.parent);
      }

      // Try opener window (for pop-ups)
      if (currentWindow.opener) {
        windows.push(currentWindow.opener);
      }
    } catch (e) {
      // Cross-domain restrictions, continue searching
    }
  }

  // No API found
  console.warn("SCORM API not found in the window hierarchy");
  return null;
}

/**
 * SCORM 1.2 API Adapter
 * Provides a consistent interface to the LMS API
 */
var ScormAdapter = {
  api: null,

  initialize: function() {
    this.api = scormFindLms();
    if (this.api && typeof this.api.LMSInitialize === "function") {
      var result = this.api.LMSInitialize("");
      return result === "true";
    }
    return false;
  },

  finish: function() {
    if (this.api && typeof this.api.LMSFinish === "function") {
      return this.api.LMSFinish("") === "true";
    }
    return false;
  },

  commit: function() {
    if (this.api && typeof this.api.LMSCommit === "function") {
      return this.api.LMSCommit("") === "true";
    }
    return false;
  },

  getValue: function(element) {
    if (this.api && typeof this.api.LMSGetValue === "function") {
      return this.api.LMSGetValue(element);
    }
    return "";
  },

  setValue: function(element, value) {
    if (this.api && typeof this.api.LMSSetValue === "function") {
      return this.api.LMSSetValue(element, value) === "true";
    }
    return false;
  },

  getErrorCode: function() {
    if (this.api && typeof this.api.LMSGetLastError === "function") {
      return this.api.LMSGetLastError();
    }
    return "0";
  },

  getErrorString: function(code) {
    if (this.api && typeof this.api.LMSGetErrorString === "function") {
      return this.api.LMSGetErrorString(code);
    }
    return "";
  },

  getDiagnostic: function(code) {
    if (this.api && typeof this.api.LMSGetDiagnostic === "function") {
      return this.api.LMSGetDiagnostic(code);
    }
    return "";
  }
};

/**
 * Initialize SCORM communication when the page loads
 */
window.addEventListener("load", function() {
  ScormAdapter.initialize();
});

/**
 * Ensure proper shutdown when the page unloads
 */
window.addEventListener("beforeunload", function() {
  ScormAdapter.finish();
});`;
}

/**
 * Helper to sanitize IDs for XML/HTML attributes.
 */
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/**
 * Helper to escape XML special characters.
 */
function escapeXml(str: string): string {
  const xmlChars: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };
  return String(str).replace(/[&<>"']/g, (char) => xmlChars[char] || char);
}

/**
 * Helper to escape HTML special characters.
 */
function escapeHtml(str: string): string {
  const htmlChars: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(str).replace(/[&<>"']/g, (char) => htmlChars[char] || char);
}

/**
 * Simple markdown to HTML converter.
 * Handles basic markdown syntax: bold, italic, links, lists, headings.
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML first
  html = escapeHtml(html);

  // Headers
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Unordered lists
  html = html.replace(/^\* (.*?)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*<\/li>)/, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.*?)$/gm, "<li>$1</li>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Links
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank">$1</a>'
  );

  // Line breaks
  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";

  return html;
}
