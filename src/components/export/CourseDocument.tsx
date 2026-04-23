import type { Curriculum } from "@/types/curriculum";
import type { BrandingTokens } from "@/lib/export/branding";
import { Cover } from "./Core/Cover";
import { TableOfContents } from "./Core/TableOfContents";
import { ModuleOpener } from "./Core/ModuleOpener";
import { LessonPage } from "./Core/LessonPage";
import { QuizBlock } from "./Core/QuizBlock";
import { Certificate } from "./Core/Certificate";

interface CourseDocumentProps {
  curriculum: Curriculum;
  branding: BrandingTokens;
  volume?: number;
}

export function CourseDocument({ curriculum, branding, volume = 1 }: CourseDocumentProps) {
  const totalLessons = curriculum.modules.reduce(
    (n, m) => n + (m.lessons?.length ?? 0),
    0,
  );
  const totalMinutes = curriculum.modules.reduce(
    (n, m) => n + m.durationMinutes,
    0,
  );
  const totalHours = Math.round(totalMinutes / 60);
  const completedAt = new Date().toISOString().slice(0, 10);

  return (
    <div className="course-document">
      <Cover
        curriculum={{ ...curriculum, totalHours, totalLessons }}
        branding={branding}
        volume={volume}
      />

      <TableOfContents modules={curriculum.modules} />

      {curriculum.modules.map((module, moduleIndex) => (
        <div key={module.id}>
          <ModuleOpener module={module} index={moduleIndex} />

          {module.lessons.map((lesson, lessonIndex) => (
            <div key={lesson.id}>
              <LessonPage
                lesson={lesson}
                moduleIndex={moduleIndex}
                lessonIndex={lessonIndex}
              />
              {lesson.quiz?.map((q, qi) => (
                <QuizBlock key={q.id} question={q} index={qi} />
              ))}
            </div>
          ))}
        </div>
      ))}

      <Certificate
        courseTitle={curriculum.title}
        totalLessons={totalLessons}
        totalHours={totalHours}
        completedAt={completedAt}
        issuer={branding.displayName}
      />
    </div>
  );
}
