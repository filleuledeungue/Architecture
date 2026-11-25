import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, RotateCcw, SkipForward } from 'lucide-react';

type OpMode = 'read' | 'write';
type MemTarget = 'ram' | 'rom';

interface StepInfo {
  title: string;
  busAddrActive: boolean;
  csActive: boolean;
  rwLabel: string;
  dataDir: 'none' | 'mem-to-cpu' | 'cpu-to-mem' | 'blocked';
  desc: string;
}

/**
 * Simulation interactive : Lecture & Écriture en Mémoire (Chronologie exacte sur les 3 bus)
 */
export const MemoryReadWriteSim: React.FC = () => {
  const [mode, setMode] = useState<OpMode>('read');
  const [target, setTarget] = useState<MemTarget>('ram');
  const [step, setStep] = useState<number>(1);
  const [ramValue, setRamValue] = useState<number>(0x3a);
  const [writeByte, setWriteByte] = useState<number>(0x5f);

  const addrStr = target === 'ram' ? '$2045' : '$E100';
  const romValue = 0x86; // Opcode LDAA #... en ROM
  const currentMemByte = target === 'ram' ? ramValue : romValue;
  const writeForbidden = mode === 'write' && target === 'rom';

  const steps: StepInfo[] =
    mode === 'read'
      ? [
          {
            title: '1. Envoi de l’adresse (Bus d’adresses BLEU)',
            busAddrActive: true,
            csActive: false,
            rwLabel: 'R/W = 1 (Lecture)',
            dataDir: 'none',
            desc: `Le processeur place l’adresse ${addrStr} sur le bus d’adresses unidirectionnel.`,
          },
          {
            title: '2. Décodage d’adresse & activation /CS (ORANGE)',
            busAddrActive: true,
            csActive: true,
            rwLabel: 'R/W = 1 · /CS = 0',
            dataDir: 'none',
            desc: `Le décodeur reconnaît ${addrStr} et active /CS_${target.toUpperCase()} = 0. Les autres puces restent en haute impédance.`,
          },
          {
            title: '3. Signal de lecture R/W = 1 & Temps d’accès',
            busAddrActive: true,
            csActive: true,
            rwLabel: 'R/W = 1 · /OE = 0',
            dataDir: 'mem-to-cpu',
            desc: `La mémoire lit sa case ${addrStr} et place l’octet $${currentMemByte.toString(16).toUpperCase().padStart(2, '0')} sur le bus de données rouge.`,
          },
          {
            title: '4. Capture par le CPU & Fin du temps de cycle',
            busAddrActive: false,
            csActive: false,
            rwLabel: '/CS = 1 (Repos)',
            dataDir: 'mem-to-cpu',
            desc: `Le processeur capture $${currentMemByte.toString(16).toUpperCase().padStart(2, '0')} dans son registre interne, puis /CS repasse à 1 avant le cycle suivant.`,
          },
        ]
      : [
          {
            title: '1. Adresse cible sur le Bus d’adresses (BLEU)',
            busAddrActive: true,
            csActive: false,
            rwLabel: 'R/W = 0 (Écriture)',
            dataDir: 'none',
            desc: `Le CPU envoie l’adresse ${addrStr} sur le bus d’adresses pour désigner la case à modifier.`,
          },
          {
            title: '2. Donnée déposée par le CPU (Bus ROUGE)',
            busAddrActive: true,
            csActive: false,
            rwLabel: 'R/W = 0 (Préparation)',
            dataDir: writeForbidden ? 'blocked' : 'cpu-to-mem',
            desc: `Le CPU dépose la nouvelle valeur $${writeByte.toString(16).toUpperCase().padStart(2, '0')} sur le bus de données bidirectionnel.`,
          },
          {
            title: '3. Activation /CS = 0 et R/W = 0 (/WE = 0)',
            busAddrActive: true,
            csActive: true,
            rwLabel: 'R/W = 0 · /WE = 0',
            dataDir: writeForbidden ? 'blocked' : 'cpu-to-mem',
            desc: writeForbidden
              ? `ALERTE MATÉRIELLE : ${addrStr} pointe vers la ROM (mémoire morte) ! La broche d’écriture /WE n’existe pas en fonctionnement normal : l’écriture est ignorée.`
              : `La RAM voit /CS_RAM = 0 et R/W = 0 : elle verrouille $${writeByte.toString(16).toUpperCase().padStart(2, '0')} dans la case ${addrStr}.`,
          },
          {
            title: '4. Validation & Temps de cycle',
            busAddrActive: false,
            csActive: false,
            rwLabel: '/CS = 1 (Stabilisé)',
            dataDir: 'none',
            desc: writeForbidden
              ? `La ROM conserve intacte sa valeur $${romValue.toString(16).toUpperCase().padStart(2, '0')}.`
              : `Écriture terminée ! La RAM contient désormais $${writeByte.toString(16).toUpperCase().padStart(2, '0')} à l’adresse ${addrStr}.`,
          },
        ];

  const current = steps[step - 1];

  const handleNextStep = () => {
    if (mode === 'write' && target === 'ram' && step === 3) {
      setRamValue(writeByte);
    }
    setStep((s) => (s >= 4 ? 1 : s + 1));
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
            Simulateur de cycle Lecture / Écriture Mémoire
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Observe dans quel ordre s’activent le Bus d’adresses (bleu), le Bus de commande (orange) et le Bus de données (rouge).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('read');
                setStep(1);
              }}
              className={`px-3 py-2 transition-colors ${
                mode === 'read'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Lecture (R/W = 1)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('write');
                setStep(1);
              }}
              className={`px-3 py-2 transition-colors ${
                mode === 'write'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Écriture (R/W = 0)
            </button>
          </div>

          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTarget('ram');
                setStep(1);
              }}
              className={`px-3 py-2 transition-colors ${
                target === 'ram'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              RAM ($2045)
            </button>
            <button
              type="button"
              onClick={() => {
                setTarget('rom');
                setStep(1);
              }}
              className={`px-3 py-2 transition-colors ${
                target === 'rom'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              ROM ($E100)
            </button>
          </div>
        </div>
      </div>

      {mode === 'write' && target === 'ram' && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            Octet à écrire :
          </span>
          {[0x5f, 0xa4, 0x19, 0xff].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setWriteByte(val)}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold border ${
                writeByte === val
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              ${val.toString(16).toUpperCase().padStart(2, '0')}
            </button>
          ))}
        </div>
      )}

      {/* Schéma animé CPU <-> 3 Bus <-> Mémoire */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4">
        <div className="md:col-span-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-500">Unité Centrale</div>
          <div className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
            CPU
          </div>
          <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
            PC / Adr : {addrStr}
          </div>
        </div>

        <div className="md:col-span-6 space-y-2.5">
          {/* Bus Adresses Bleu */}
          <div
            className={`rounded-xl border px-3 py-2 flex items-center justify-between text-xs font-mono transition-all ${
              current.busAddrActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 opacity-55'
            }`}
          >
            <span className="font-bold">Bus d’adresses (n bits)</span>
            <span className="inline-flex items-center gap-1.5 font-bold">
              {current.busAddrActive ? `${addrStr}` : 'En attente'}
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </span>
          </div>

          {/* Bus Commande Orange */}
          <div
            className={`rounded-xl border px-3 py-2 flex items-center justify-between text-xs font-mono transition-all ${
              current.csActive
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 opacity-75'
            }`}
          >
            <span className="font-bold">Bus de commande</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">
              {current.rwLabel}
            </span>
          </div>

          {/* Bus Données Rouge */}
          <div
            className={`rounded-xl border px-3 py-2 flex items-center justify-between text-xs font-mono transition-all ${
              current.dataDir === 'blocked'
                ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100'
                : current.dataDir !== 'none'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 opacity-55'
            }`}
          >
            <span className="font-bold">Bus de données (8 bits)</span>
            <span className="inline-flex items-center gap-1.5 font-bold">
              {current.dataDir === 'mem-to-cpu' && (
                <>
                  <ArrowLeft className="w-4 h-4 text-rose-600" />
                  <span>
                    ${currentMemByte.toString(16).toUpperCase().padStart(2, '0')} (Mémoire → CPU)
                  </span>
                </>
              )}
              {current.dataDir === 'cpu-to-mem' && (
                <>
                  <span>
                    ${writeByte.toString(16).toUpperCase().padStart(2, '0')} (CPU → Mémoire)
                  </span>
                  <ArrowRight className="w-4 h-4 text-rose-600" />
                </>
              )}
              {current.dataDir === 'blocked' && (
                <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4" />
                  ROM en lecture seule !
                </span>
              )}
              {current.dataDir === 'none' && <span>Haute impédance (Hi-Z)</span>}
            </span>
          </div>
        </div>

        <div
          className={`md:col-span-3 rounded-xl border-2 p-4 text-center space-y-1 transition-all ${
            current.csActive
              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="text-[11px] font-mono uppercase text-slate-500">
            {target === 'ram' ? 'Mémoire Vive' : 'Mémoire Morte'}
          </div>
          <div className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
            {target.toUpperCase()}
          </div>
          <div className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
            Case {addrStr} = ${currentMemByte.toString(16).toUpperCase().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Étape en cours + Contrôles */}
      <motion.div
        key={`${mode}-${target}-${step}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-4 space-y-1.5 ${
          writeForbidden && step >= 3
            ? 'border-rose-300 dark:border-rose-700 bg-rose-50/70 dark:bg-rose-950/30'
            : 'border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-sky-900 dark:text-sky-200">{current.title}</span>
          <span className="font-mono text-slate-500">Étape {step}/4</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {current.desc}
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleNextStep}
          className="min-h-[44px] px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <SkipForward className="w-4 h-4" />
          <span>{step === 4 ? 'Recommencer le cycle' : 'Étape suivante'}</span>
        </button>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Revenir à l’étape 1</span>
        </button>
        {step === 4 && !writeForbidden && (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 ml-2">
            <CheckCircle2 className="w-4 h-4" />
            Cycle terminé !
          </span>
        )}
      </div>
    </div>
  );
};
