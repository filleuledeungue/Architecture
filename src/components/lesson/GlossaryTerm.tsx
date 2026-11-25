import React, { useState } from 'react';
import { BookOpen, ArrowUpRight } from 'lucide-react';
import { findGlossaryEntry } from '../../content/glossary';
import { useAppStore } from '../../store/useAppStore';
import { HighlightedText } from './HighlightedText';

interface GlossaryTermProps {
  glossaryId: string;
  label?: string;
}

/**
 * Terme interactif du glossaire : clic ou survol ouvre un encart à 3 niveaux
 * avec lien direct vers le glossaire complet.
 */
export const GlossaryTerm: React.FC<GlossaryTermProps> = ({ glossaryId, label }) => {
  const entry = findGlossaryEntry(glossaryId);
  const { setView } = useAppStore();
  const [open, setOpen] = useState(false);

  if (!entry) return <span>{label ?? glossaryId}</span>;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-left px-2.5 py-1.5 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-sky-400 dark:hover:border-sky-500 text-sm font-medium text-slate-800 dark:text-slate-100 transition-colors"
      >
        {entry.busColor && (
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{
              backgroundColor:
                entry.busColor === 'address'
                  ? 'var(--bus-address)'
                  : entry.busColor === 'data'
                    ? 'var(--bus-data)'
                    : 'var(--bus-control)',
            }}
          />
        )}
        <span>{label ?? entry.term}</span>
        <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Définition : ${entry.term}`}
          className="mt-2 sm:w-96 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4 z-30 text-left space-y-2.5"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
                {entry.moduleRef}
              </div>
              <h5 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
                {entry.term}
              </h5>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1"
            >
              Fermer
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong className="text-amber-700 dark:text-amber-400">Analogie :</strong>{' '}
            <HighlightedText text={entry.kidAnalogy} />
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
            <strong className="text-sky-700 dark:text-sky-400">Définition :</strong>{' '}
            <HighlightedText text={entry.simpleDef} />
          </p>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setView({ type: 'glossary', highlightId: entry.id });
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline pt-1"
          >
            <span>Voir la fiche complète dans le glossaire</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </span>
  );
};
