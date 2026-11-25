import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Cpu, Terminal } from 'lucide-react';

interface SplashScreenProps {
  onEnter: (destination?: 'dashboard' | 'lab68' | 'labpic') => void;
}

/**
 * Écran d'accueil animé affiché au chargement initial du site : « PARRAIN DEUNGUE »
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#070D19] text-slate-50 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Tracé de circuit animé en arrière-plan */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <motion.path
          d="M -50 180 L 320 180 L 420 280 L 820 280 L 920 180 L 1250 180"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
        <motion.path
          d="M -50 620 L 280 620 L 380 520 L 860 520 L 960 620 L 1250 620"
          fill="none"
          stroke="#f87171"
          strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 2.0, delay: 0.2, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 160 -20 L 160 360 L 260 440 L 940 440 L 1040 360 L 1040 820"
          fill="none"
          stroke="#fb923c"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 2.2, delay: 0.35, ease: 'easeInOut' }}
        />
      </svg>

      {/* Halo doux subtil */}
      <div
        className="absolute w-[520px] h-[520px] rounded-full bg-sky-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Contenu central */}
      <motion.div
        className="relative z-10 max-w-3xl w-full text-center space-y-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <motion.h1
          className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
        >
          PARRAIN DEUNGUE
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.55 }}
        >
          Plateforme interactive pour maîtriser{' '}
          <strong className="text-white">l’Architecture des Systèmes à Processeurs</strong>{' '}
          (Von Neumann, Harvard, Mémoires, 68HC11, PIC16F887 & TP L2GE).
        </motion.p>

        <motion.div
          className="pt-4 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          <button
            type="button"
            onClick={() => onEnter('dashboard')}
            className="min-h-[52px] px-7 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-display font-bold text-base inline-flex items-center gap-2.5 shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98]"
          >
            <span>Entrer sur la plateforme</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onEnter('lab68')}
            className="min-h-[52px] px-5 rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
          >
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Tester Labo 68HC11</span>
          </button>

          <button
            type="button"
            onClick={() => onEnter('labpic')}
            className="min-h-[52px] px-5 rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Tester Labo PIC16F887</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
