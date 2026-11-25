import React, { useState } from 'react';
import { Calculator, Cpu } from 'lucide-react';

interface PresetBus {
  label: string;
  bits: number;
  wordBits: number;
  note: string;
}

const PRESETS: PresetBus[] = [
  { label: '68HC11 (Cours)', bits: 16, wordBits: 8, note: '64 Kio de $0000 à $FFFF' },
  { label: 'PIC16F887 Prog.', bits: 13, wordBits: 14, note: '8 K mots de 14 bits (Harvard)' },
  { label: 'PIC16F887 RAM', bits: 9, wordBits: 8, note: '512 emplacements sur 4 banques' },
  { label: 'Intel 8086', bits: 20, wordBits: 8, note: '1 Mio adressable' },
];

function formatCapacity(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mio = bytes / (1024 * 1024);
    return `${mio.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Mio`;
  }
  if (bytes >= 1024) {
    const kio = bytes / 1024;
    return `${kio.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Kio`;
  }
  return `${bytes.toLocaleString('fr-FR')} octets`;
}

/**
 * Calculateur interactif pour la leçon 1.4 : Espace adressable 2^n et format mémoire
 */
export const BusCapacityPlayground: React.FC = () => {
  const [bits, setBits] = useState<number>(16);
  const [wordBits, setWordBits] = useState<number>(8);

  const locations = Math.pow(2, bits);
  const totalBytes = (locations * wordBits) / 8;
  const maxHex = (locations - 1).toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0');
  const minHex = '0'.repeat(Math.ceil(bits / 4));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="px-4 py-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
            Calculateur interactif : Espace adressable 2ⁿ
          </h4>
        </div>
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          n = {bits} fils
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Préréglages du cours */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = p.bits === bits && p.wordBits === wordBits;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setBits(p.bits);
                  setWordBits(p.wordBits);
                }}
                className={`min-h-[40px] px-3 rounded-xl text-xs font-medium border inline-flex items-center gap-1.5 transition-colors ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sliders explicites avec étiquettes et unités */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300">
                Largeur du bus d’adresses (n)
              </span>
              <span className="font-mono font-semibold text-sky-700 dark:text-sky-400 tabular-nums">
                {bits} bits ({bits} fils)
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={24}
              step={1}
              value={bits}
              onChange={(e) => setBits(Number(e.target.value))}
              aria-label="Largeur du bus d'adresses en bits"
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>4 bits</span>
              <span>12 bits</span>
              <span>16 bits</span>
              <span>24 bits</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300">
                Format d’une case mémoire
              </span>
              <span className="font-mono font-semibold text-rose-700 dark:text-rose-400 tabular-nums">
                {wordBits} bits / adresse
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              {[8, 14, 16, 32].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWordBits(w)}
                  className={`flex-1 min-h-[40px] rounded-lg font-mono text-xs font-medium border transition-colors ${
                    wordBits === w
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {w}b
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Résultats calculés en direct */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Nombre d’emplacements (2^{bits})
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {locations.toLocaleString('fr-FR')}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Capacité totale ({wordBits}b/case)
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-sky-700 dark:text-sky-400 tabular-nums">
              {formatCapacity(totalBytes)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Plage hexadécimale
            </div>
            <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums truncate">
              ${minHex} → ${maxHex}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
