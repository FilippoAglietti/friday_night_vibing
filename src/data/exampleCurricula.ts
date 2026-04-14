import type { Curriculum, TeachingStyle } from "@/types/curriculum";

import { mktCourse } from "./courses/marketingCourse";
import { dsCourse } from "./courses/designCourse";
import { tsCourse } from "./courses/typescriptCourse";

export type ExampleCurriculum = {
  curriculum: Curriculum;
  teachingStyle: TeachingStyle;
};

// Each example is paired with a distinct teaching style so the preview modal
// and exports render in a visibly different layout per card.
export const exampleCurriculaWithStyles: ExampleCurriculum[] = [
  { curriculum: mktCourse, teachingStyle: "hands-on" },
  { curriculum: dsCourse, teachingStyle: "storytelling" },
  { curriculum: tsCourse, teachingStyle: "academic" },
];

export const exampleCurricula: Curriculum[] = exampleCurriculaWithStyles.map(
  (e) => e.curriculum,
);
