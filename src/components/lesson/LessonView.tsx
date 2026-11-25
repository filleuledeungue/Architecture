import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Sparkles,
  Cpu,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Clock,
  BookMarked,
  Terminal,
  BookOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ExplanationLevel, LessonData } from '../../types/course';
import { getAdjacentLessons, getModuleById } from '../../content/modules';
import { useAppStore } from '../../store/useAppStore';
import { GlossaryTerm } from './GlossaryTerm';
import { HighlightedText } from './HighlightedText';
import { BusCapacityPlayground } from '../../simulations/BusCapacityPlayground';
import { MipsCpiCalculator } from '../../simulations/MipsCpiCalculator';

const VonNeumannHarvard3D = lazy(() =>
  import('../../simulations/VonNeumannHarvard3D').then((m) => ({
    default: m.VonNeumannHarvard3D,
  })),
);
const AddressDecoding3D = lazy(() =>
  import('../../simulations/AddressDecoding3D').then((m) => ({
    default: m.AddressDecoding3D,
  })),
);
const MemoryReadWriteSim = lazy(() =>
  import('../../simulations/MemoryReadWriteSim').then((m) => ({
    default: m.MemoryReadWriteSim,
  })),
);
const InterruptFlowSim = lazy(() =>
  import('../../simulations/InterruptFlowSim').then((m) => ({
    default: m.InterruptFlowSim,
  })),
);

interface LessonViewProps {
  lesson: LessonData;
}

const LEVEL_TABS: {
  id: ExplanationLevel;
  label: string;
  shortDesc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'kid',
    label: 'Analogie du quotidien',
    shortDesc: 'Image de la vie réelle',
    icon: Compass,
  },
  {
    id: 'simple',
    label: 'Version simple',
    shortDesc: 'Explication claire',
    icon: Sparkles,
  },
  {
    id: 'technical',
    label: 'Version technique',
    shortDesc: 'Registres, bits & cours exact',
    icon: Cpu,
  },
];

export const LessonView: React.FC<LessonViewProps> = ({ lesson }) => {
  const {
    state,
    setPreferredLevel,
    markCheckpointPassed,
    markLessonCompleted,
    openLesson,
    setView,
  } = useAppStore();

  const [level, setLevel] = useState<ExplanationLevel>(state.preferences.preferredLevel);
  const [showAlternativeAnalogy, setShowAlternativeAnalogy] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const moduleInfo = getModuleById(lesson.moduleId);
  const { prev, next } = getAdjacentLessons(lesson.id);
  const isCompleted = state.completedLessons.includes(lesson.id);
  const isCheckpointDone = state.completedCheckpoints.includes(lesson.id);
  const hasInstructionTables = Boolean(
    lesson.deepDiveSections?.some((s) => s.instructions && s.instructions.length > 0),
  );

  useEffect(() => {
    setLevel(state.preferences.preferredLevel);
  }, [state.preferences.preferredLevel]);

  useEffect(() => {
    setShowAlternativeAnalogy(false);
    setSelectedOptionId(null);
    setShowHint(false);
    setExpandedTables({});
  }, [lesson.id]);

  const handleSelectOption = (optionId: string, isCorrect: boolean) => {
    setSelectedOptionId(optionId);
    if (isCorrect) {
      markCheckpointPassed(lesson.id);
      markLessonCompleted(lesson.id);
    }
  };

  const chosenOption = lesson.checkpoint.options.find((o) => o.id === selectedOptionId);

  return (
    <article
      className={`${
        hasInstructionTables ? 'max-w-7xl' : 'max-w-5xl'
      } mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8`}
    >
      <header className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setView({ type: 'dashboard' })}
            className="hover:text-sky-600 dark:hover:text-sky-400 font-medium"
          >
            Parcours
          </button>
          <span>/</span>
          <span>
            Module {moduleInfo?.number ?? 1} · {moduleInfo?.shortTitle}
          </span>
          <span>/</span>
          <span className="font-mono text-sky-700 dark:text-sky-400 font-semibold">
            Leçon {lesson.number}
          </span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {lesson.number} · {lesson.title}
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">{lesson.subtitle}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Clock className="w-4 h-4 text-slate-400" />
              {lesson.durationMin} min
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Terminée
              </span>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <BookMarked className="w-3.5 h-3.5 shrink-0" />
          <span>Source officielle : {lesson.pdfReference}</span>
        </div>
      </header>

      {/* Légende couleurs des mots-clés */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-700 dark:text-slate-200">Code couleur :</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          <span className="font-semibold text-blue-700 dark:text-blue-400">Adresses & pointeurs</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400" />
          <span className="font-semibold text-rose-700 dark:text-rose-400">Données, mémoires & ports</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
          <span className="font-semibold text-amber-700 dark:text-amber-400">Commande, flags & interruptions</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">Architectures & instructions</span>
        </span>
      </div>

      {/* Section 1 : Pourquoi ça existe ? */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-2.5 shadow-sm"
      >
        <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
          1. Pourquoi ça existe ?
        </div>
        <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-base">
          <HighlightedText text={lesson.whyItExists} />
        </p>
      </motion.section>

      {/* Section 2 : Les 3 niveaux d'explication */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Comprendre à ton rythme
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Commence par l’analogie puis monte vers la définition d’examen.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAlternativeAnalogy((s) => !s)}
            className="min-h-[44px] px-3.5 rounded-xl border border-amber-300 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-semibold inline-flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>
              {showAlternativeAnalogy ? 'Masquer l’autre exemple' : 'Je ne comprends pas'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-200 dark:border-slate-800">
          {LEVEL_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = level === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setLevel(tab.id);
                  setPreferredLevel(tab.id);
                }}
                className={`relative min-h-[52px] px-4 py-3 text-left flex items-center gap-3 transition-colors border-b sm:border-b-0 sm:border-r last:border-r-0 border-slate-200 dark:border-slate-800 ${
                  active
                    ? 'bg-sky-50/80 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-sm font-semibold leading-tight">{tab.label}</div>
                  <div className="text-[11px] opacity-80">{tab.shortDesc}</div>
                </div>
                {active && (
                  <motion.div
                    layoutId={`level-bar-${lesson.id}`}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {level === 'kid' && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Analogie : {lesson.levels.kid.analogyTag}
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                    <HighlightedText text={lesson.levels.kid.body} />
                  </p>
                </div>
              )}

              {level === 'simple' && (
                <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                  <HighlightedText text={lesson.levels.simple.body} />
                </p>
              )}

              {level === 'technical' && (
                <div className="space-y-4">
                  <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                    <HighlightedText text={lesson.levels.technical.body} />
                  </p>
                  {lesson.levels.technical.specs && (
                    <ul className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 space-y-2 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {lesson.levels.technical.specs.map((spec) => (
                        <li key={spec} className="flex items-start gap-2">
                          <span className="text-sky-600 dark:text-sky-400">▸</span>
                          <HighlightedText text={spec} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {showAlternativeAnalogy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-xl border border-amber-300 dark:border-amber-700/70 bg-amber-50/80 dark:bg-amber-950/30 p-4 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Lightbulb className="w-4 h-4" />
                <span>{lesson.levels.alternativeAnalogy.title}</span>
              </div>
              <p className="text-sm text-amber-950 dark:text-amber-100 leading-relaxed">
                <HighlightedText text={lesson.levels.alternativeAnalogy.body} />
              </p>
            </motion.div>
          )}

          {lesson.glossaryKeys.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
                Mots-clés cliquables :
              </span>
              {lesson.glossaryKeys.map((gKey) => (
                <GlossaryTerm key={gKey} glossaryId={gKey} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 3 : Comment ça marche ? */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            2. Comment ça marche ?
          </div>
          <p className="mt-1.5 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            <HighlightedText text={lesson.howItWorks.summary} />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {lesson.howItWorks.steps.map((step) => {
            const busStyle =
              step.highlightBus === 'address'
                ? 'var(--bus-address)'
                : step.highlightBus === 'data'
                  ? 'var(--bus-data)'
                  : 'var(--bus-control)';

            return (
              <div
                key={step.label}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: busStyle }}
                  />
                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {step.label}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <HighlightedText text={step.detail} />
                </p>
              </div>
            );
          })}
        </div>

        {lesson.howItWorks.courseNoteWarning && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-700/70 bg-amber-50/60 dark:bg-amber-950/30 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {lesson.howItWorks.courseNoteWarning.title}
              </div>
              <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-relaxed">
                <HighlightedText text={lesson.howItWorks.courseNoteWarning.detail} />
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Sections d'approfondissement & tableaux d'instructions */}
      {lesson.deepDiveSections && lesson.deepDiveSections.length > 0 && (
        <section className="space-y-5">
          {lesson.deepDiveSections.map((deep) => {
            const accentBorder =
              deep.accent === 'emerald'
                ? 'border-emerald-200 dark:border-emerald-800/60'
                : deep.accent === 'amber'
                  ? 'border-amber-200 dark:border-amber-800/60'
                  : deep.accent === 'rose'
                    ? 'border-rose-200 dark:border-rose-800/60'
                    : 'border-sky-200 dark:border-sky-800/60';
            const accentLabel =
              deep.accent === 'emerald'
                ? 'text-emerald-700 dark:text-emerald-400'
                : deep.accent === 'amber'
                  ? 'text-amber-700 dark:text-amber-400'
                  : deep.accent === 'rose'
                    ? 'text-rose-700 dark:text-rose-400'
                    : 'text-sky-700 dark:text-sky-400';

            const isTableExpanded = Boolean(expandedTables[deep.title]);
            const hasInstructions = Boolean(deep.instructions && deep.instructions.length > 0);

            return (
              <div
                key={deep.title}
                className={`rounded-2xl border ${accentBorder} bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 shadow-sm`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${accentLabel}`}>
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Approfondissement du cours</span>
                    </div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                      {deep.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {deep.subtitle}
                    </p>
                  </div>

                  {hasInstructions && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTables((prev) => ({
                          ...prev,
                          [deep.title]: !prev[deep.title],
                        }))
                      }
                      className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-sky-500 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
                    >
                      {isTableExpanded ? (
                        <Minimize2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      )}
                      <span>{isTableExpanded ? 'Taille standard' : 'Agrandir le tableau'}</span>
                    </button>
                  )}
                </div>

                {deep.paragraphs && deep.paragraphs.length > 0 && (
                  <div className="space-y-2.5">
                    {deep.paragraphs.map((para) => (
                      <p
                        key={para}
                        className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed"
                      >
                        <HighlightedText text={para} />
                      </p>
                    ))}
                  </div>
                )}

                {deep.instructions && deep.instructions.length > 0 && (
                  <>
                    {/* Vue bureau/tablette : 100% largeur sans barre de défilement horizontale */}
                    <div className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <table
                        className={`w-full table-fixed text-left border-collapse ${
                          isTableExpanded ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                        }`}
                      >
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                            <th className="w-[16%] py-3 px-3 font-semibold">Instruction</th>
                            <th className="w-[14%] py-3 px-3 font-semibold">Catégorie</th>
                            <th className="w-[31%] py-3 px-3 font-semibold">Fonctionnement</th>
                            <th className="w-[12%] py-3 px-3 font-semibold">Flags</th>
                            <th className="w-[27%] py-3 px-3 font-semibold">Exemple & Usage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {deep.instructions.map((row) => (
                            <tr
                              key={`${row.mnemonic}-${row.example}`}
                              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 align-top"
                            >
                              <td
                                className={`${
                                  isTableExpanded ? 'py-4 px-3.5' : 'py-3 px-3'
                                } font-mono font-bold text-emerald-700 dark:text-emerald-400 break-words`}
                              >
                                {row.mnemonic}
                              </td>
                              <td
                                className={`${
                                  isTableExpanded ? 'py-4 px-3.5' : 'py-3 px-3'
                                } text-xs font-medium text-slate-500 dark:text-slate-400 break-words`}
                              >
                                {row.family}
                              </td>
                              <td
                                className={`${
                                  isTableExpanded ? 'py-4 px-3.5' : 'py-3 px-3'
                                } text-slate-700 dark:text-slate-200 leading-relaxed break-words`}
                              >
                                <HighlightedText text={row.action} />
                              </td>
                              <td
                                className={`${
                                  isTableExpanded ? 'py-4 px-3.5' : 'py-3 px-3'
                                } font-mono text-xs text-amber-700 dark:text-amber-400 break-words`}
                              >
                                {row.flags ?? '—'}
                              </td>
                              <td
                                className={`${
                                  isTableExpanded ? 'py-4 px-3.5' : 'py-3 px-3'
                                } space-y-1.5 break-words`}
                              >
                                <div className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md inline-block break-all">
                                  {row.example}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                  <HighlightedText text={row.usageNote} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Vue mobile : fiches empilées sans aucun scroll horizontal */}
                    <div className="md:hidden space-y-3">
                      {deep.instructions.map((row) => (
                        <div
                          key={`${row.mnemonic}-${row.example}-mobile`}
                          className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 ${
                            isTableExpanded ? 'p-4 text-sm' : 'p-3.5 text-xs'
                          } space-y-2`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                              {row.mnemonic}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {row.family}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                            <HighlightedText text={row.action} />
                          </p>
                          <div className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md inline-block border border-slate-200 dark:border-slate-700">
                            {row.example}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            <HighlightedText text={row.usageNote} />
                          </p>
                          {row.flags && (
                            <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                              Flags : {row.flags}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Section 4 : À toi de jouer ! */}
      <section className="space-y-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
          3. À toi de jouer !
        </div>

        {lesson.simulationId === 'von-neumann-harvard' && (
          <Suspense
            fallback={
              <div className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-sm text-slate-500">
                Chargement de la simulation interactive…
              </div>
            }
          >
            <VonNeumannHarvard3D />
          </Suspense>
        )}

        {lesson.simulationId === 'address-decoding' && (
          <Suspense
            fallback={
              <div className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-sm text-slate-500">
                Chargement du simulateur de décodage d’adresse…
              </div>
            }
          >
            <AddressDecoding3D />
          </Suspense>
        )}

        {lesson.simulationId === 'memory-rw-cycle' && (
          <Suspense
            fallback={
              <div className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-sm text-slate-500">
                Chargement du simulateur Lecture / Écriture mémoire…
              </div>
            }
          >
            <MemoryReadWriteSim />
          </Suspense>
        )}

        {lesson.simulationId === 'interrupt-flow' && (
          <Suspense
            fallback={
              <div className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-sm text-slate-500">
                Chargement du simulateur d’interruptions…
              </div>
            }
          >
            <InterruptFlowSim />
          </Suspense>
        )}

        {lesson.simulationId === 'bus-capacity-playground' && <BusCapacityPlayground />}
        {lesson.simulationId === 'mips-cpi-playground' && <MipsCpiCalculator />}

        {lesson.simulationId === 'link-lab-68hc11' && (
          <div className="rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                Passe à la pratique sur le Labo 68HC11 !
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Assemble tes instructions LDAA/ADDA/BSET et observe les LEDs de PORTB et les flags CCR en direct.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView({ type: 'lab-68hc11' })}
              className="min-h-[46px] px-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span>Ouvrir le Labo 68HC11</span>
            </button>
          </div>
        )}

        {lesson.simulationId === 'link-lab-pic16f887' && (
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                Teste l’armoire 4 Banques & le TP1 sur le Labo PIC16F887 !
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Observe RP1:RP0 basculer entre Banque 0, 1, 2 et 3 et teste les boutons RA0–RA3 avec les LEDs RD0–RD3.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView({ type: 'lab-pic16f887' })}
              className="min-h-[46px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>Ouvrir le Labo PIC16F887</span>
            </button>
          </div>
        )}

        {/* Checkpoint */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
              Vérification rapide
            </h3>
            {isCheckpointDone && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Validée
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100">
            <HighlightedText text={lesson.checkpoint.question} />
          </p>

          <div className="space-y-2.5">
            {lesson.checkpoint.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let btnClass =
                'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-sky-400 dark:hover:border-sky-500 text-slate-800 dark:text-slate-200';
              if (isSelected) {
                btnClass = opt.isCorrect
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100'
                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-950 dark:text-rose-100';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id, opt.isCorrect)}
                  className={`w-full min-h-[48px] text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-start gap-3 ${btnClass}`}
                >
                  <span className="font-mono font-bold uppercase text-xs mt-0.5 opacity-70">
                    {opt.id}.
                  </span>
                  <span>
                    <HighlightedText text={opt.label} />
                  </span>
                </button>
              );
            })}
          </div>

          {chosenOption && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-3.5 text-sm border ${
                chosenOption.isCorrect
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100'
                  : 'border-rose-300 dark:border-rose-700 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100'
              }`}
            >
              <HighlightedText text={chosenOption.feedback} />
            </motion.div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowHint((h) => !h)}
              className="min-h-[40px] text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'Masquer l’indice' : 'Besoin d’un indice ?'}</span>
            </button>

            {!isCompleted && (
              <button
                type="button"
                onClick={() => markLessonCompleted(lesson.id)}
                className="min-h-[44px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs font-semibold transition-colors"
              >
                Marquer cette leçon comme terminée
              </button>
            )}
          </div>

          {showHint && (
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <strong>Indice :</strong> <HighlightedText text={lesson.checkpoint.hint} />
            </p>
          )}
        </div>
      </section>

      {/* Section 5 : Ce qu'il faut retenir */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/70 p-5 sm:p-6 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          4. Ce qu’il faut retenir
        </div>
        <ul className="space-y-2">
          {lesson.keyTakeaways.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2.5 text-sm sm:text-base text-slate-800 dark:text-slate-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <span>
                <HighlightedText text={point} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Navigation Précédent / Suivant */}
      <nav
        aria-label="Navigation entre les leçons"
        className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
      >
        {prev ? (
          <button
            type="button"
            onClick={() => openLesson(prev.moduleId, prev.id)}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-left inline-flex items-center gap-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-500">Leçon précédente</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {prev.number} · {prev.title}
              </div>
            </div>
          </button>
        ) : (
          <div />
        )}

        {next ? (
          <button
            type="button"
            onClick={() => {
              markLessonCompleted(lesson.id);
              openLesson(next.moduleId, next.id);
            }}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-right inline-flex items-center gap-3 transition-colors ml-auto"
          >
            <div>
              <div className="text-[11px] text-sky-100">Leçon suivante</div>
              <div className="text-sm font-semibold">
                {next.number} · {next.title}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              markLessonCompleted(lesson.id);
              setView({ type: 'dashboard' });
            }}
            className="min-h-[48px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm inline-flex items-center gap-2 ml-auto transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Retour au tableau de bord</span>
          </button>
        )}
      </nav>
    </article>
  );
};
