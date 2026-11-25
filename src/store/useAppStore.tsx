import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppView,
  BadgeDefinition,
  FontSizeScale,
  UserPreferences,
  UserProgressState,
} from '../types/progress';
import { ExplanationLevel } from '../types/course';

const STORAGE_KEY = 'archproc_esp_state_v1';

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'premier-pas',
    title: 'Premier Circuit',
    description: 'Première leçon validée dans le parcours Architecture.',
    iconName: 'compass',
  },
  {
    id: 'maitre-bus',
    title: 'Chef d’Orchestre des Bus',
    description: 'Comprendre la séparation Adresses / Données / Commande.',
    iconName: 'bus',
  },
  {
    id: 'architecte-memoire',
    title: 'Architecte Mémoire',
    description: 'Maîtriser le décodage d’adresse et la cartographie $0000–$FFFF.',
    iconName: 'map',
  },
  {
    id: 'module-1-complet',
    title: 'Module 1 Validé',
    description: 'Toutes les leçons et vérifications du Module 1 réussies.',
    iconName: 'award',
  },
  {
    id: 'assiduite-3j',
    title: 'Série de 3 jours',
    description: 'Trois jours consécutifs de révision sur la plateforme.',
    iconName: 'flame',
  },
];

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultState(): UserProgressState {
  return {
    version: 1,
    completedLessons: [],
    completedCheckpoints: [],
    unlockedModules: [
      'module-1',
      'module-2',
      'module-3',
      'module-4',
      'module-5',
      'module-6',
      'module-7',
    ],
    quizScores: {},
    earnedBadges: [],
    streakDays: 1,
    lastActiveDate: getTodayIso(),
    activeLessonId: '1-1-von-neumann-harvard',
    preferences: {
      theme: 'light',
      fontSize: 'normal',
      colorBlind: false,
      lowPerfMode: false,
      preferredLevel: 'kid',
    },
  };
}

function loadStateFromStorage(): UserProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<UserProgressState>;
    const defaults = getDefaultState();
    const today = getTodayIso();

    let streak = parsed.streakDays ?? 1;
    const lastDate = parsed.lastActiveDate ?? today;

    if (lastDate !== today) {
      const prev = new Date(lastDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    }

    const earnedBadges = new Set(parsed.earnedBadges ?? []);
    if (streak >= 3) earnedBadges.add('assiduite-3j');

    return {
      ...defaults,
      ...parsed,
      unlockedModules: defaults.unlockedModules,
      streakDays: streak,
      lastActiveDate: today,
      earnedBadges: Array.from(earnedBadges),
      preferences: {
        ...defaults.preferences,
        ...(parsed.preferences ?? {}),
      },
    };
  } catch {
    return getDefaultState();
  }
}

interface AppStoreContextValue {
  state: UserProgressState;
  view: AppView;
  setView: (view: AppView) => void;
  openLesson: (moduleId: string, lessonId: string) => void;
  markLessonCompleted: (lessonId: string) => void;
  markCheckpointPassed: (lessonId: string) => void;
  saveQuizScore: (quizId: string, scorePct: number) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  setPreferredLevel: (level: ExplanationLevel) => void;
  exportProgressJson: () => string;
  importProgressJson: (jsonText: string) => { ok: boolean; message: string };
  resetProgress: () => void;
  newlyEarnedBadge: BadgeDefinition | null;
  dismissBadgeToast: () => void;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

const FONT_SCALE_MAP: Record<FontSizeScale, string> = {
  normal: '1',
  large: '1.12',
  xlarge: '1.24',
};

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserProgressState>(() => loadStateFromStorage());
  const [view, setView] = useState<AppView>({ type: 'dashboard' });
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<BadgeDefinition | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorer si quota dépassé
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (state.preferences.colorBlind) {
      root.classList.add('colorblind');
    } else {
      root.classList.remove('colorblind');
    }

    root.style.setProperty('--app-font-scale', FONT_SCALE_MAP[state.preferences.fontSize]);
  }, [state.preferences]);

  const awardBadgeIfMissing = useCallback((badgeId: string, current: string[]): string[] => {
    if (current.includes(badgeId)) return current;
    const def = BADGE_CATALOG.find((b) => b.id === badgeId);
    if (def) setNewlyEarnedBadge(def);
    return [...current, badgeId];
  }, []);

  const openLesson = useCallback((moduleId: string, lessonId: string) => {
    setState((prev) => ({ ...prev, activeLessonId: lessonId }));
    setView({ type: 'lesson', moduleId, lessonId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const markLessonCompleted = useCallback(
    (lessonId: string) => {
      setState((prev) => {
        if (prev.completedLessons.includes(lessonId)) return prev;
        const nextCompleted = [...prev.completedLessons, lessonId];
        let nextBadges = [...prev.earnedBadges];

        if (nextCompleted.length >= 1) {
          nextBadges = awardBadgeIfMissing('premier-pas', nextBadges);
        }
        if (lessonId === '1-3-trois-bus') {
          nextBadges = awardBadgeIfMissing('maitre-bus', nextBadges);
        }
        if (lessonId === '1-6-cartographie-memoire') {
          nextBadges = awardBadgeIfMissing('architecte-memoire', nextBadges);
        }
        const m1Lessons = [
          '1-1-von-neumann-harvard',
          '1-2-blocs-fondamentaux',
          '1-3-trois-bus',
          '1-4-espace-adressable',
          '1-5-decodage-adresse',
          '1-6-cartographie-memoire',
        ];
        if (m1Lessons.every((id) => nextCompleted.includes(id))) {
          nextBadges = awardBadgeIfMissing('module-1-complet', nextBadges);
        }

        return {
          ...prev,
          completedLessons: nextCompleted,
          earnedBadges: nextBadges,
        };
      });
    },
    [awardBadgeIfMissing],
  );

  const markCheckpointPassed = useCallback((lessonId: string) => {
    setState((prev) => {
      if (prev.completedCheckpoints.includes(lessonId)) return prev;
      return {
        ...prev,
        completedCheckpoints: [...prev.completedCheckpoints, lessonId],
      };
    });
  }, []);

  const saveQuizScore = useCallback((quizId: string, scorePct: number) => {
    setState((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [quizId]: Math.max(prev.quizScores[quizId] ?? 0, scorePct),
      },
    }));
  }, []);

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...patch,
      },
    }));
  }, []);

  const setPreferredLevel = useCallback(
    (level: ExplanationLevel) => {
      updatePreferences({ preferredLevel: level });
    },
    [updatePreferences],
  );

  const exportProgressJson = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importProgressJson = useCallback((jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText) as Partial<UserProgressState>;
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.completedLessons)) {
        return {
          ok: false,
          message: 'Fichier invalide : structure de progression non reconnue.',
        };
      }
      const defaults = getDefaultState();
      setState({
        ...defaults,
        ...parsed,
        unlockedModules: defaults.unlockedModules,
        preferences: {
          ...defaults.preferences,
          ...(parsed.preferences ?? {}),
        },
      });
      return {
        ok: true,
        message: 'Progression importée avec succès.',
      };
    } catch {
      return {
        ok: false,
        message: 'Impossible de lire ce fichier JSON.',
      };
    }
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = getDefaultState();
    setState((prev) => ({
      ...fresh,
      preferences: prev.preferences,
    }));
  }, []);

  const dismissBadgeToast = useCallback(() => {
    setNewlyEarnedBadge(null);
  }, []);

  return (
    <AppStoreContext.Provider
      value={{
        state,
        view,
        setView,
        openLesson,
        markLessonCompleted,
        markCheckpointPassed,
        saveQuizScore,
        updatePreferences,
        setPreferredLevel,
        exportProgressJson,
        importProgressJson,
        resetProgress,
        newlyEarnedBadge,
        dismissBadgeToast,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
};

export function useAppStore(): AppStoreContextValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error('useAppStore doit être utilisé dans un AppStoreProvider.');
  }
  return ctx;
}
