import type { Curriculum, TeachingStyle } from "@/types/curriculum";

import { mktCourse } from "./courses/marketingCourse";
import { dsCourse } from "./courses/designCourse";
import { tsCourse } from "./courses/typescriptCourse";

export type ExampleCurriculum = {
  curriculum: Curriculum;
  teachingStyle: TeachingStyle;
  /** Which tier this example demonstrates on the landing page. */
  tier: "planner" | "masterclass";
};

// Each example is paired with a distinct teaching style so the preview modal
// and exports render in a visibly different layout per card.
export const exampleCurriculaWithStyles: ExampleCurriculum[] = [
  { curriculum: mktCourse, teachingStyle: "hands-on", tier: "masterclass" },
  { curriculum: dsCourse, teachingStyle: "storytelling", tier: "planner" },
  { curriculum: tsCourse, teachingStyle: "academic", tier: "masterclass" },
];

export const exampleCurricula: Curriculum[] = exampleCurriculaWithStyles.map(
  (e) => e.curriculum,
);
