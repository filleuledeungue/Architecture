import React, { useMemo, useState } from 'react';
import { Search, X, BookOpen, FileText } from 'lucide-react';
import { COURSE_MODULES } from '../../content/modules';
import { GLOSSARY_ENTRIES } from '../../content/glossary';
import { useAppStore } from '../../store/useAppStore';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Recherche globale instantanée dans les leçons et le glossaire
 */
export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const { openLesson, setView } = useAppStore();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const lessons = COURSE_MODULES.flatMap((m) => m.lessons).filter(
      (l) =>
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.whyItExists.toLowerCase().includes(q) ||
        l.levels.simple.body.toLowerCase().includes(q),
    );
    const glossary = GLOSSARY_ENTRIES.filter(
      (g) =>
        !q ||
        g.term.toLowerCase().includes(q) ||
        g.simpleDef.toLowerCase().includes(q) ||
        g.kidAnalogy.toLowerCase().includes(q),
    );
    return { lessons: lessons.slice(0, 6), glossary: glossary.slice(0, 6) };
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 flex items-start justify-center p-4 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche globale"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une leçon ou un terme (ex. Harvard, $2000, CS, 2^n)…"
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:outline-none min-h-[40px]"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la recherche"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5">
          {results.lessons.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Leçons du cours
              </div>
              {results.lessons.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    openLesson(l.moduleId, l.id);
                    onClose();
                  }}
                  className="w-full min-h-[48px] px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors"
                >
                  <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-1" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {l.number} · {l.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{l.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.glossary.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Glossaire
              </div>
              {results.glossary.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setView({ type: 'glossary', highlightId: g.id });
                    onClose();
                  }}
                  className="w-full min-h-[48px] px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {g.term}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {g.simpleDef}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.lessons.length === 0 && results.glossary.length === 0 && (
            <p className="text-sm text-center text-slate-500 py-6">
              Aucun résultat trouvé pour « {query} ».
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
