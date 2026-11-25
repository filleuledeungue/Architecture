import { CourseModule, LessonData } from '../../types/course';
import { MODULE_1 } from './module1-architecture';
import { MODULES_2_TO_7 } from './modules2to7';

/**
 * Catalogue complet des 7 modules du parcours : tous accessibles librement sans verrouillage.
 */
export const COURSE_MODULES: CourseModule[] = [MODULE_1, ...MODULES_2_TO_7];

export function getModuleById(moduleId: string): CourseModule | undefined {
  return COURSE_MODULES.find((m) => m.id === moduleId);
}

export function getLessonById(lessonId: string): LessonData | undefined {
  for (const mod of COURSE_MODULES) {
    const found = mod.lessons.find((l) => l.id === lessonId);
    if (found) return found;
  }
  return undefined;
}

export function getAdjacentLessons(lessonId: string): {
  prev?: LessonData;
  next?: LessonData;
} {
  const allLessons = COURSE_MODULES.flatMap((m) => m.lessons);
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? allLessons[idx - 1] : undefined,
    next: idx < allLessons.length - 1 ? allLessons[idx + 1] : undefined,
  };
}
