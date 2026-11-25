import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BellRing, ShieldAlert, ShieldCheck, SkipForward, RotateCcw } from 'lucide-react';

interface TimelineSlice {
  label: string;
  level: 0 | 1 | 2 | 3;
  pcNote: string;
  desc: string;
}

const SCENARIO_TIMELINE: TimelineSlice[] = [
  {
    label: 'Prog. Principal (Niv. 0)',
    level: 0,
    pcNote: 'PC = 0x0024',
    desc: 'Le CPU exécute le programme principal normalement (GIE = 1, interruptions autorisées).',
  },
  {
    label: 'Requête Niv. 2 → Sauvegarde PC',
    level: 2,
    pcNote: 'Pile ← 0x0025 · PC ← Vecteur IT2',
    desc: 'Une interruption de Niveau 2 arrive ! Le drapeau passe à 1, le CPU termine l’instruction en cours, empile PC, inhibe GIE=0 et saute vers l’ISR Niveau 2.',
  },
  {
    label: 'Requête Niv. 3 préempte Niv. 2 !',
    level: 3,
    pcNote: 'Pile ← ISR2 · PC ← Vecteur IT3',
    desc: 'Une interruption PLUS PRIORITAIRE (Niveau 3 > Niveau 2) arrive : le CPU suspend immédiatement le Niveau 2 pour traiter l’urgence Niveau 3.',
  },
  {
    label: 'Fin Niv. 3 (RETFIE/RTI) → Reprise Niv. 2',
    level: 2,
    pcNote: 'Flag3 ← 0 · Dépilement vers ISR2',
    desc: 'L’ISR Niveau 3 remet son drapeau à 0 et exécute RTI / RETFIE. Le CPU reprend exactement là où il avait laissé le Niveau 2.',
  },
  {
    label: 'Requête Niv. 1 mise en attente → Exécutée après Niv. 2',
    level: 1,
    pcNote: 'Flag2 ← 0 · Exécution ISR1',
    desc: 'Une requête de Niveau 1 (< Niveau 2) avait patienté pendant le Niveau 2. Dès que Niveau 2 finit, Niveau 1 s’exécute avant le retour au programme principal.',
  },
  {
    label: 'Retour Prog. Principal (Niv. 0)',
    level: 0,
    pcNote: 'Flag1 ← 0 · PC ← 0x0025 · GIE=1',
    desc: 'Toutes les interruptions sont terminées : PC est rechargé depuis la pile et GIE repasse à 1.',
  },
];

/**
 * Simulation interactive des Interruptions (Diapo 7 PDF 4 : priorités imbriquées & masquage)
 */
export const InterruptFlowSim: React.FC = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const [masked, setMasked] = useState(false);

  const slice = masked
    ? {
        label: 'Interruptions MASQUÉES (GIE = 0 / bit I = 1)',
        level: 0 as const,
        pcNote: 'PC continue normalement',
        desc: 'Le masque global est verrouillé ! Même si des requêtes arrivent sur les broches IRQ/INT, le CPU continue le programme principal sans être dérangé jusqu’à la réautorisation (GIE=1 / CLI).',
      }
    : SCENARIO_TIMELINE[stepIdx];

  const levelColors: Record<0 | 1 | 2 | 3, string> = {
    0: 'bg-amber-400/90 text-slate-950',
    1: 'bg-purple-600 text-white',
    2: 'bg-rose-600 text-white',
    3: 'bg-teal-600 text-white',
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
            Simulateur de Priorités & Déroulement des Interruptions (Diapo 7)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Teste le masquage global (GIE / bit I) et observe comment le Niveau 3 préempte le Niveau 2 tandis que le Niveau 1 patiente.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMasked((m) => !m)}
          className={`min-h-[42px] px-4 rounded-xl text-xs font-semibold border inline-flex items-center gap-2 transition-colors ${
            masked
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-400'
          }`}
        >
          {masked ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{masked ? 'Masque actif (GIE=0 / I=1)' : 'Interruptions autorisées (GIE=1 / CLI)'}</span>
        </button>
      </div>

      {/* Diagramme des 4 niveaux (fidèle à la diapo 7 du PDF 4) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2.5">
        {[3, 2, 1, 0].map((lvl) => {
          const isCurrent = slice.level === lvl;
          const levelName =
            lvl === 0
              ? 'Niveau 0 · Programme Principal'
              : `Niveau ${lvl} · Interruption prioritaire`;
          return (
            <div key={lvl} className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-5 sm:col-span-4 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                {levelName}
              </div>
              <div className="col-span-7 sm:col-span-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 p-1 flex items-center">
                {isCurrent && (
                  <motion.div
                    layoutId="active-irq-bar"
                    className={`h-full px-3 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm ${levelColors[lvl as 0 | 1 | 2 | 3]}`}
                  >
                    <BellRing className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">CPU actif ici</span>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trace pédagogique de l'étape */}
      <motion.div
        key={`${masked}-${stepIdx}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-4 space-y-1.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <span className="text-sky-900 dark:text-sky-200">{slice.label}</span>
          <span className="font-mono text-blue-700 dark:text-blue-400">{slice.pcNote}</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{slice.desc}</p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={masked}
          onClick={() => setStepIdx((i) => (i + 1) % SCENARIO_TIMELINE.length)}
          className="min-h-[44px] px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <SkipForward className="w-4 h-4" />
          <span>Étape suivante ({stepIdx + 1}/{SCENARIO_TIMELINE.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMasked(false);
            setStepIdx(0);
          }}
          className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Réinitialiser</span>
        </button>
      </div>
    </div>
  );
};
