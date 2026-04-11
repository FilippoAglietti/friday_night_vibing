import type { Curriculum } from "@/types/curriculum";

import { mktCourse } from "./courses/marketingCourse";
import { dsCourse } from "./courses/designCourse";
import { tsCourse } from "./courses/typescriptCourse";

export const exampleCurricula: Curriculum[] = [
  mktCourse,
  dsCourse,
  tsCourse,
];
