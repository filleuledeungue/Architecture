import React, { useState } from 'react';
import { Gauge, Layers } from 'lucide-react';

/**
 * Sandbox interactif Modules 2 & 3 : Calculateur CPI / MIPS + Simulateur Cache Hit/Miss
 */
export const MipsCpiCalculator: React.FC = () => {
  const [freqMhz, setFreqMhz] = useState(16);
  const [cpi, setCpi] = useState(2);
  const [instrCount, setInstrCount] = useState(100000);
  const [cacheState, setCacheState] = useState<'hit' | 'miss'>('hit');

  const mips = freqMhz / cpi;
  const execTimeMs = ((instrCount * cpi) / (freqMhz * 1_000_000)) * 1000;

  return (
    <div className="space-y-5">
      {/* Calculateur CPI / MIPS */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="px-4 py-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
              Calculateur interactif : CPI & Performance MIPS
            </h4>
          </div>
          <span className="font-mono text-xs text-slate-500">MIPS = F_H / CPI</span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Fréquence horloge (F_H)</span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                  {freqMhz} MHz
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={freqMhz}
                onChange={(e) => setFreqMhz(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>CPI moyen (Cycles/Instr)</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                  {cpi.toFixed(1)} cycles
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={cpi}
                onChange={(e) => setCpi(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Nombre d’instructions</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                  {instrCount.toLocaleString('fr-FR')}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={1000000}
                step={10000}
                value={instrCount}
                onChange={(e) => setInstrCount(Number(e.target.value))}
                className="w-full accent-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
              <div className="text-xs text-slate-500 dark:text-slate-400">Vitesse calculée</div>
              <div className="font-mono text-2xl font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                {mips.toFixed(2)} MIPS
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Temps d’exécution total
              </div>
              <div className="font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {execTimeMs.toFixed(3)} ms
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulateur Cache Hit vs Miss */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
              Mémoire Cache : Comparer Hit vs Miss (Diapo 7)
            </h4>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCacheState('hit')}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold border transition-colors ${
                cacheState === 'hit'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              Cas a) Cache HIT
            </button>
            <button
              type="button"
              onClick={() => setCacheState('miss')}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold border transition-colors ${
                cacheState === 'miss'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              Cas b) Cache MISS
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-700 dark:text-slate-200">
          {cacheState === 'hit' ? (
            <p>
              <strong>Cache HIT (~5 ns) :</strong> (1) Le CPU envoie sa requête au Cache → la donnée est déjà là → (2) Le Cache répond immédiatement. La mémoire principale lente n’est même pas dérangée !
            </p>
          ) : (
            <p>
              <strong>Cache MISS (~10 à 20 ns) :</strong> (1) Le CPU demande au Cache → absent ! (2) Le Cache interroge la Mémoire principale → (3) La Mémoire copie la donnée dans le Cache → (4) Le Cache la transmet enfin au CPU.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
