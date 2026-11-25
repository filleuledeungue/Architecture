import React, { useRef, useState } from 'react';
import {
  X,
  Sun,
  Moon,
  Eye,
  Type,
  Gauge,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FontSizeScale } from '../../types/progress';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Panneau Accessibilité & Sauvegarde de progression (Export/Import JSON sans popup native)
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const {
    state,
    updatePreferences,
    exportProgressJson,
    importProgressJson,
    resetProgress,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!open) return null;

  const handleExport = () => {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progression-archproc-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback('Sauvegarde JSON téléchargée.');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = importProgressJson(text);
    setFeedback(res.message);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Préférences d'accessibilité et sauvegarde"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
            Accessibilité & Progression
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Thème Clair / Sombre */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {state.preferences.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-sky-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Apparence
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Mode clair ou sombre
                </div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {(['light', 'dark'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updatePreferences({ theme: mode })}
                  className={`min-h-[42px] px-3.5 rounded-xl text-xs font-semibold border transition-colors ${
                    state.preferences.theme === mode
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {mode === 'light' ? 'Clair' : 'Sombre'}
                </button>
              ))}
            </div>
          </div>

          {/* Taille de police */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-slate-500" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Taille du texte
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Confort de lecture
                </div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {(
                [
                  { id: 'normal', label: 'Normal' },
                  { id: 'large', label: 'Grand' },
                  { id: 'xlarge', label: 'XL' },
                ] as { id: FontSizeScale; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updatePreferences({ fontSize: item.id })}
                  className={`min-h-[42px] px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    state.preferences.fontSize === item.id
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode daltonien Okabe-Ito */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Mode daltonien (Okabe-Ito)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Adapte les couleurs des 3 bus et états
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                updatePreferences({ colorBlind: !state.preferences.colorBlind })
              }
              className={`min-h-[42px] px-4 rounded-xl text-xs font-semibold border transition-colors ${
                state.preferences.colorBlind
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {state.preferences.colorBlind ? 'Activé' : 'Désactivé'}
            </button>
          </div>

          {/* Mode performance réduite */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Gauge className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Performance réduite (2D Éco)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Utilise les schémas 2D SVG légers sur mobile
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                updatePreferences({ lowPerfMode: !state.preferences.lowPerfMode })
              }
              className={`min-h-[42px] px-4 rounded-xl text-xs font-semibold border transition-colors ${
                state.preferences.lowPerfMode
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {state.preferences.lowPerfMode ? 'Activé' : 'Désactivé'}
            </button>
          </div>

          {/* Export / Import JSON */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sauvegarde locale (JSON)
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Exporter JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Importer JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="min-h-[44px] px-3.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold inline-flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Réinitialiser</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      resetProgress();
                      setConfirmReset(false);
                      setFeedback('Progression remise à zéro.');
                    }}
                    className="min-h-[40px] px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="min-h-[40px] px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>

            {feedback && (
              <p className="text-xs font-medium text-sky-700 dark:text-sky-400">{feedback}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
