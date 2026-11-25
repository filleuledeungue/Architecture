import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Box,
  Layers,
  Gauge,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface SceneWrapperProps {
  title: string;
  subtitle: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  renderMode: '3d' | '2d';
  onRenderModeChange: (mode: '3d' | '2d') => void;
  statusText: string;
  extraControls?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conteneur unifié pour les simulations (Zone 1 : Scène 3D/2D ; Zone 2 : Barre de contrôle + légende)
 * Respecte l'accessibilité tactile (>= 44px) et le mode performance réduite pour smartphones.
 */
export const SceneWrapper: React.FC<SceneWrapperProps> = ({
  title,
  subtitle,
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  speed,
  onSpeedChange,
  renderMode,
  onRenderModeChange,
  statusText,
  extraControls,
  children,
}) => {
  const { state, updatePreferences } = useAppStore();

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      {/* En-tête compact de la simulation */}
      <div className="px-4 py-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/80">
        <div>
          <h4 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
            {title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>

        {/* Sélecteur 3D WebGL vs 2D SVG (mode éco) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onRenderModeChange('3d');
              if (state.preferences.lowPerfMode) {
                updatePreferences({ lowPerfMode: false });
              }
            }}
            className={`min-h-[40px] px-3 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors border ${
              renderMode === '3d'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Vue 3D</span>
          </button>
          <button
            type="button"
            onClick={() => onRenderModeChange('2d')}
            className={`min-h-[40px] px-3 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors border ${
              renderMode === '2d'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Mode léger 2D pour économiser la batterie ou les téléphones modestes"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schéma 2D Éco</span>
          </button>
        </div>
      </div>

      {/* Zone 1 : Scène interactive (sans superposition opaque bloquante) */}
      <div className="relative w-full bg-slate-950/5 dark:bg-slate-950">{children}</div>

      {/* Zone 2 : Panneau de lecture en direct + contrôles */}
      <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
        {/* État pédagogique courant */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200">
          <span className="font-semibold text-sky-700 dark:text-sky-400 mr-2">
            État en direct :
          </span>
          <span>{statusText}</span>
        </div>

        {/* Contrôles personnalisés propres à la scène (ex. choix d'adresse) */}
        {extraControls}

        {/* Dock de lecture : Play / Pause / Pas à pas / Vitesse / Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className="min-h-[44px] px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm inline-flex items-center gap-2 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Lecture'}</span>
            </button>

            <button
              type="button"
              onClick={onStep}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium text-sm inline-flex items-center gap-1.5 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              <span>Pas à pas</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
          </div>

          {/* Sélecteur de vitesse */}
          <div className="flex items-center gap-1.5 text-xs">
            <Gauge className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-1" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Vitesse :</span>
            {[0.5, 1, 2].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onSpeedChange(v)}
                className={`min-h-[38px] min-w-[44px] px-2.5 rounded-lg font-mono font-medium transition-colors border ${
                  speed === v
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {v}×
              </button>
            ))}
          </div>
        </div>

        {/* Légende officielle des 3 bus du cours (couleur + direction + texte, jamais couleur seule) */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm shrink-0"
              style={{ backgroundColor: 'var(--bus-address)' }}
            />
            <span>
              <strong>Bus d’adresses</strong> (→ Unidirectionnel)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm shrink-0"
              style={{ backgroundColor: 'var(--bus-data)' }}
            />
            <span>
              <strong>Bus de données</strong> (⇄ Bidirectionnel)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm shrink-0"
              style={{ backgroundColor: 'var(--bus-control)' }}
            />
            <span>
              <strong>Bus de commande</strong> (R/W · CS · Synchro)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
