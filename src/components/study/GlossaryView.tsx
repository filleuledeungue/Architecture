import React, { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { GLOSSARY_ENTRIES } from '../../content/glossary';
import { HighlightedText } from '../lesson/HighlightedText';

interface GlossaryViewProps {
  highlightId?: string;
}

/**
 * Glossaire complet filtrable avec affichage des 3 niveaux par notion
 */
export const GlossaryView: React.FC<GlossaryViewProps> = ({ highlightId }) => {
  const [query, setQuery] = useState('');
  const [busFilter, setBusFilter] = useState<'all' | 'address' | 'data' | 'control'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY_ENTRIES.filter((entry) => {
      if (busFilter !== 'all' && entry.busColor !== busFilter) return false;
      if (!q) return true;
      return (
        entry.term.toLowerCase().includes(q) ||
        entry.simpleDef.toLowerCase().includes(q) ||
        entry.kidAnalogy.toLowerCase().includes(q) ||
        entry.technicalDef.toLowerCase().includes(q) ||
        (entry.aliases ?? []).some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [query, busFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <header className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Référentiel du cours</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
          Glossaire interactif
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Chaque terme clé du cours expliqué avec une analogie du quotidien, une définition simple et la formule technique exacte.
        </p>
      </header>

      {/* Barre de filtre */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un terme (ex. Harvard, CS, 2^n, goulot…)"
            className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'address', label: 'Bus Adresses' },
            { id: 'data', label: 'Bus Données' },
            { id: 'control', label: 'Commande / CS' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setBusFilter(btn.id as typeof busFilter)}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-medium border transition-colors ${
                busFilter === btn.id
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des fiches */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((entry) => {
          const isHighlighted = entry.id === highlightId;
          return (
            <div
              key={entry.id}
              className={`rounded-2xl border p-5 space-y-3 transition-colors ${
                isHighlighted
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {entry.busColor && (
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
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
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
                    {entry.term}
                  </h2>
                </div>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {entry.moduleRef}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 p-3.5 space-y-1">
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Analogie du quotidien
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    <HighlightedText text={entry.kidAnalogy} />
                  </p>
                </div>

                <div className="rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/40 p-3.5 space-y-1">
                  <div className="text-xs font-bold text-sky-800 dark:text-sky-300">
                    Version simple
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    <HighlightedText text={entry.simpleDef} />
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 space-y-1">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Version technique
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    <HighlightedText text={entry.technicalDef} />
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
            Aucun terme trouvé pour « {query} ». Essaie un autre mot-clé.
          </div>
        )}
      </div>
    </div>
  );
};
