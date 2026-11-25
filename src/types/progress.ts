/**
 * Types pour le suivi de progression, les préférences d'accessibilité et les badges
 */

export type ThemeMode = 'light' | 'dark';
export type FontSizeScale = 'normal' | 'large' | 'xlarge';

export interface UserPreferences {
  theme: ThemeMode;
  fontSize: FontSizeScale;
  colorBlind: boolean;
  lowPerfMode: boolean;
  preferredLevel: 'kid' | 'simple' | 'technical';
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  iconName: 'compass' | 'cpu' | 'bus' | 'map' | 'award' | 'flame';
}

export interface UserProgressState {
  version: number;
  completedLessons: string[];
  completedCheckpoints: string[];
  unlockedModules: string[];
  quizScores: Record<string, number>;
  earnedBadges: string[];
  streakDays: number;
  lastActiveDate: string;
  activeLessonId: string;
  preferences: UserPreferences;
}

export type AppView =
  | { type: 'dashboard' }
  | { type: 'lesson'; moduleId: string; lessonId: string }
  | { type: 'lab-68hc11'; presetId?: string }
  | { type: 'lab-pic16f887'; presetId?: string }
  | { type: 'tp-quiz' }
  | { type: 'glossary'; highlightId?: string };
