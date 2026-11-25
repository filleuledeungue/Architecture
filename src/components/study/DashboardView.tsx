import React from 'react';
import { motion } from 'motion/react';
import {
  PlayCircle,
  CheckCircle2,
  Flame,
  Award,
  Compass,
  Cpu,
  Map,
  ArrowRight,
  BookOpen,
  Terminal,
  ClipboardCheck,
} from 'lucide-react';
import { COURSE_MODULES } from '../../content/modules';
import { BADGE_CATALOG, useAppStore } from '../../store/useAppStore';
import { BadgeDefinition } from '../../types/progress';

function renderBadgeIcon(name: BadgeDefinition['iconName'], earned: boolean) {
  const cls = `w-5 h-5 ${earned ? 'text-amber-500' : 'text-slate-400 dark:text-slate-600'}`;
  switch (name) {
    case 'compass':
      return <Compass className={cls} />;
    case 'bus':
      return <Cpu className={cls} />;
    case 'map':
      return <Map className={cls} />;
    case 'flame':
      return <Flame className={cls} />;
    default:
      return <Award className={cls} />;
  }
}

/**
 * Tableau de bord d'accueil : tous les modules et tous les labos sont librement accessibles !
 */
export const DashboardView: React.FC = () => {
  const { state, openLesson, setView } = useAppStore();

  const allLessons = COURSE_MODULES.flatMap((m) => m.lessons);
  const totalDone = allLessons.filter((l) => state.completedLessons.includes(l.id)).length;
  const totalPct = Math.round((totalDone / Math.max(1, allLessons.length)) * 100);

  const resumeLesson =
    allLessons.find((l) => !state.completedLessons.includes(l.id)) ?? allLessons[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Bannière d'accueil dynamique */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              ESP DAKAR / DUT · Filleul Deungue · Cours Pr M. L. NDIAYE
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              Architecture des Systèmes à Processeurs
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Accède librement à tous les modules (1 à 7), aux simulateurs assembleur <strong>68HC11</strong> & <strong>PIC16F887</strong>, aux <strong>TP L2GE</strong> et aux animations 3D sans aucune restriction.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openLesson(resumeLesson.moduleId, resumeLesson.id)}
                className="min-h-[48px] px-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm inline-flex items-center gap-2 transition-transform active:scale-[0.98] shadow-sm"
              >
                <PlayCircle className="w-5 h-5" />
                <span>
                  {totalDone === 0
                    ? 'Commencer : Module 1'
                    : `Continuer : ${resumeLesson.number} · ${resumeLesson.title}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setView({ type: 'glossary' })}
                className="min-h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Glossaire</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Progression</div>
              <div className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-slate-50 tabular-nums">
                {totalPct}%
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                {totalDone} / {allLessons.length} leçons
              </div>
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <motion.div
                  className="h-full bg-sky-600 dark:bg-sky-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalPct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Série active</span>
              </div>
              <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-slate-50 tabular-nums">
                {state.streakDays} j
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                {state.earnedBadges.length} / {BADGE_CATALOG.length} badges
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Accès direct aux Labos interactifs & TP */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          type="button"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setView({ type: 'lab-68hc11' })}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-left space-y-2 shadow-sm hover:border-sky-400 transition-colors"
        >
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <Terminal className="w-5 h-5" />
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
            Labo Assembleur 68HC11
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Éditeur + exécution pas à pas, registres A/B/D, CCR, PORTB LEDs & convertisseur Bin/Hex/Déc.
          </p>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setView({ type: 'lab-pic16f887' })}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-left space-y-2 shadow-sm hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <Cpu className="w-5 h-5" />
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
            Labo PIC16F887 & 4 Banques
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Armoire 4 tiroirs RP1:RP0, détection d’oubli de banque et maquette boutons/LEDs TP1 L2GE.
          </p>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setView({ type: 'tp-quiz' })}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-left space-y-2 shadow-sm hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <ClipboardCheck className="w-5 h-5" />
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
            TP L2GE & Quiz d’examen
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Les 5 TP officiels L2GE (LEDs, 7-seg, Feux, LCD, TMP36) et quiz interactif corrigé.
          </p>
        </motion.button>
      </section>

      {/* Parcours complet des 7 modules — tous ouverts ! */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Les 7 Modules du Cours (Accès libre)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Clique sur n’importe quelle leçon directement
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COURSE_MODULES.map((mod, idx) => {
            const doneCount = mod.lessons.filter((l) =>
              state.completedLessons.includes(l.id),
            ).length;

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-bold text-sky-700 dark:text-sky-400">
                      MODULE {mod.number}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ouvert · {doneCount}/{mod.lessons.length}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                    {mod.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {mod.lessons.map((l) => {
                    const done = state.completedLessons.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => openLesson(mod.id, l.id)}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl text-left text-xs sm:text-sm flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-medium">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              done ? 'bg-emerald-500' : 'bg-sky-400/70'
                            }`}
                          />
                          <span>
                            {l.number} · {l.title}
                          </span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
          Badges de progression
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {BADGE_CATALOG.map((badge) => {
            const earned = state.earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-4 space-y-2 transition-colors ${
                  earned
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  {renderBadgeIcon(badge.iconName, earned)}
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {earned ? 'Obtenu' : 'À débloquer'}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {badge.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
