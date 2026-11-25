import React, { useEffect, useState } from 'react';
import {
  Menu,
  X,
  Search,
  SlidersHorizontal,
  Cpu,
  BookOpen,
  LayoutDashboard,
  CheckCircle2,
  Terminal,
  ClipboardCheck,
  Award,
  Sun,
  Moon,
} from 'lucide-react';
import { COURSE_MODULES } from '../../content/modules';
import { useAppStore } from '../../store/useAppStore';
import { SearchModal } from './SearchModal';
import { SettingsModal } from './SettingsModal';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    state,
    view,
    setView,
    openLesson,
    updatePreferences,
    newlyEarnedBadge,
    dismissBadgeToast,
  } = useAppStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
          ESP DAKAR / DUT · Filleul Deungue
        </div>
        <div className="font-display font-extrabold text-base text-slate-900 dark:text-slate-100 mt-0.5">
          PARRAIN DEUNGUE
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-5" aria-label="Menu du cours">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setView({ type: 'dashboard' });
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[44px] px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-colors ${
              view.type === 'dashboard'
                ? 'bg-sky-50 text-sky-900 dark:bg-sky-950/60 dark:text-sky-100 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Tableau de bord</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setView({ type: 'glossary' });
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[44px] px-3 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-colors ${
              view.type === 'glossary'
                ? 'bg-sky-50 text-sky-900 dark:bg-sky-950/60 dark:text-sky-100 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Glossaire du cours</span>
          </button>
        </div>

        {/* Ateliers & Labos directement ouverts */}
        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Labos & TP (Accès libre)
          </div>
          <button
            type="button"
            onClick={() => {
              setView({ type: 'lab-68hc11' });
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[44px] px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
              view.type === 'lab-68hc11'
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" />
            <span>Labo 68HC11 (Assembleur)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setView({ type: 'lab-pic16f887' });
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[44px] px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
              view.type === 'lab-pic16f887'
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>Labo PIC16F887 & Banques</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setView({ type: 'tp-quiz' });
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[44px] px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
              view.type === 'tp-quiz'
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 shrink-0" />
            <span>TP L2GE & Quiz</span>
          </button>
        </div>

        {/* Arbre des 7 modules (tous ouverts) */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Modules 1 à 7
          </div>

          {COURSE_MODULES.map((mod) => (
            <div key={mod.id} className="space-y-1">
              <div className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                M{mod.number} · {mod.shortTitle}
              </div>

              <div className="pl-2 space-y-0.5">
                {mod.lessons.map((l) => {
                  const active = view.type === 'lesson' && view.lessonId === l.id;
                  const done = state.completedLessons.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        openLesson(mod.id, l.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full min-h-[42px] px-3 py-2 rounded-xl text-left text-xs flex items-center gap-2 transition-colors ${
                        active
                          ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            active ? 'text-emerald-300 dark:text-slate-950' : 'text-emerald-500'
                          }`}
                        />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0 ml-1 mr-1" />
                      )}
                      <span className="truncate">
                        {l.number} {l.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex">
      <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/60 flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[calc(100%-61px)] overflow-y-auto">{SidebarContent}</div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu des modules"
              className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setView({ type: 'dashboard' })}
              className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate"
            >
              Architecture des Systèmes à Processeurs
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher dans le cours"
              className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 inline-flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Rechercher</span>
              <kbd className="hidden md:inline text-[10px] font-mono opacity-60">Ctrl K</kbd>
            </button>

            <button
              type="button"
              onClick={() =>
                updatePreferences({
                  theme: state.preferences.theme === 'dark' ? 'light' : 'dark',
                })
              }
              aria-label="Basculer thème clair ou sombre"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {state.preferences.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Paramètres d'accessibilité et sauvegarde"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {newlyEarnedBadge && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 shadow-xl p-4 flex items-start gap-3"
        >
          <Award className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Nouveau badge débloqué !
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {newlyEarnedBadge.title}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {newlyEarnedBadge.description}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissBadgeToast}
            aria-label="Fermer la notification"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
