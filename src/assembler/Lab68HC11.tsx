import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Terminal,
  AlertCircle,
  ArrowLeftRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface Preset68 {
  id: string;
  title: string;
  desc: string;
  code: string;
}

const PRESETS_68HC11: Preset68[] = [
  {
    id: 'add-portb',
    title: '1. Addition & LEDs PORTB',
    desc: 'Charge $05 dans A, ajoute $03, stocke en RAM ($0060) et affiche sur PORTB ($1004).',
    code: `; Programme CISC 68HC11 : Addition + sortie PORTB
        ORG $2000
PORTB   EQU $1004
        LDAA #$05     ; A = 5
        ADDA #$03     ; A = A + 3 = $08
        STAA $60      ; Sauvegarde en RAM ($0060)
        STAA PORTB    ; Allume LED3 sur PORTB
        LDAB #$2A     ; D = A:B = $082A
        STOP`,
  },
  {
    id: 'loop-counter',
    title: '2. Boucle compteur (BNE)',
    desc: 'Compte de 5 à 0 en décrémentant A et affiche chaque étape sur PORTB.',
    code: `; Boucle avec branchement conditionnel BNE
        ORG $2000
PORTB   EQU $1004
        LDAA #$05
LOOP:   STAA PORTB    ; Affiche A sur les LEDs
        DECA          ; A = A - 1 (met à jour Z)
        BNE LOOP      ; Tant que Z=0, retourne à LOOP
        STAA PORTB    ; Affiche 0 à la fin
        STOP`,
  },
  {
    id: 'stack-bset',
    title: '3. Pile (PHA/PLA) & BSET/BCLR',
    desc: 'Sauvegarde A sur la pile SP, modifie les bits de PORTB et restaure A.',
    code: `; Manipulation pile et masques binaires
        ORG $2000
PORTB   EQU $1004
        LDAA #%00001111
        PHA           ; Empile A sur la pile SP
        LDAA #$00
        STAA PORTB
        BSET PORTB, #%00110001  ; Active bits 5,4,0
        BCLR PORTB, #$01        ; Éteint bit 0
        PLA           ; Restaure A = $0F
        STOP`,
  },
];

interface ParsedLine {
  lineNo: number;
  addr: number;
  op: string;
  arg: string;
  raw: string;
}

interface Cpu68State {
  a: number;
  b: number;
  x: number;
  y: number;
  sp: number;
  pc: number;
  ccr: number; // bits: 7:S 6:X 5:H 4:I 3:N 2:Z 1:V 0:C
  ram: Record<number, number>;
  halted: boolean;
  steps: number;
  lastLog: string;
}

function parseNumber68(token: string, symbols: Record<string, number>): number | null {
  const clean = token.trim();
  if (!clean) return null;
  if (symbols[clean.toUpperCase()] !== undefined) return symbols[clean.toUpperCase()];
  if (clean.startsWith('$')) {
    const v = parseInt(clean.slice(1), 16);
    return Number.isNaN(v) ? null : v;
  }
  if (/^0x/i.test(clean)) {
    const v = parseInt(clean.slice(2), 16);
    return Number.isNaN(v) ? null : v;
  }
  if (clean.startsWith('%')) {
    const v = parseInt(clean.slice(1), 2);
    return Number.isNaN(v) ? null : v;
  }
  if (/^[0-9]+$/.test(clean)) {
    return parseInt(clean, 10);
  }
  return null;
}

function assemble68HC11(source: string): {
  lines: ParsedLine[];
  labels: Record<string, number>;
  symbols: Record<string, number>;
  errors: string[];
} {
  const rawLines = source.split('\n');
  const symbols: Record<string, number> = {
    PORTA: 0x1000,
    PORTC: 0x1003,
    PORTB: 0x1004,
    DDRC: 0x1007,
  };
  const labels: Record<string, number> = {};
  const parsed: ParsedLine[] = [];
  const errors: string[] = [];
  let pc = 0x2000;

  rawLines.forEach((rawLine, idx) => {
    const noComment = rawLine.split(';')[0].trim();
    if (!noComment || noComment.startsWith('*')) return;

    // EQU
    const equMatch = noComment.match(/^([A-Za-z_]\w*)\s+EQU\s+(.+)$/i);
    if (equMatch) {
      const val = parseNumber68(equMatch[2], symbols);
      if (val === null) {
        errors.push(`Ligne ${idx + 1} : valeur EQU invalide (${equMatch[2]}).`);
      } else {
        symbols[equMatch[1].toUpperCase()] = val & 0xffff;
      }
      return;
    }

    // ORG
    const orgMatch = noComment.match(/^ORG\s+(.+)$/i);
    if (orgMatch) {
      const val = parseNumber68(orgMatch[1], symbols);
      if (val === null) {
        errors.push(`Ligne ${idx + 1} : adresse ORG invalide.`);
      } else {
        pc = val & 0xffff;
      }
      return;
    }

    let rest = noComment;
    const labelColon = rest.match(/^([A-Za-z_]\w*):\s*(.*)$/);
    if (labelColon) {
      labels[labelColon[1].toUpperCase()] = pc;
      rest = labelColon[2].trim();
      if (!rest) return;
    }

    const parts = rest.split(/\s+/);
    const op = parts[0].toUpperCase();
    const arg = parts.slice(1).join(' ').trim();
    parsed.push({ lineNo: idx + 1, addr: pc, op, arg, raw: rawLine });
    pc = (pc + 2) & 0xffff;
  });

  return { lines: parsed, labels, symbols, errors };
}

function createInitialCpu(startPc: number): Cpu68State {
  return {
    a: 0,
    b: 0,
    x: 0,
    y: 0,
    sp: 0x00ff,
    pc: startPc,
    ccr: 0b01010000, // X=1, I=1
    ram: { 0x1003: 0x00, 0x1004: 0x00 },
    halted: false,
    steps: 0,
    lastLog: 'Prêt : clique sur « Pas à pas » ou « Exécuter ».',
  };
}

function updateNZC(ccr: number, val8: number, carry?: boolean, overflow?: boolean): number {
  const v = val8 & 0xff;
  let next = ccr;
  next = v & 0x80 ? next | 0x08 : next & ~0x08; // N
  next = v === 0 ? next | 0x04 : next & ~0x04; // Z
  if (overflow !== undefined) next = overflow ? next | 0x02 : next & ~0x02;
  if (carry !== undefined) next = carry ? next | 0x01 : next & ~0x01;
  return next;
}

/**
 * Labo complet 68HC11 : Assembleur + Émulateur CPU/Registres/CCR/Mémoire/PORTB + Convertisseur Bin/Hex/Déc
 */
export const Lab68HC11: React.FC<{ initialPresetId?: string }> = ({ initialPresetId }) => {
  const defaultPreset =
    PRESETS_68HC11.find((p) => p.id === initialPresetId) ?? PRESETS_68HC11[0];
  const [source, setSource] = useState(defaultPreset.code);
  const [compiled, setCompiled] = useState(() => assemble68HC11(defaultPreset.code));
  const [cpu, setCpu] = useState<Cpu68State>(() =>
    createInitialCpu(compiled.lines[0]?.addr ?? 0x2000),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [editorHeight, setEditorHeight] = useState<'normal' | 'grand' | 'xl'>('normal');
  const [editorWide, setEditorWide] = useState(false);

  // Convertisseur Bin / Hex / Déc
  const [convNum, setConvNum] = useState<number>(42);

  const cpuRef = useRef(cpu);
  cpuRef.current = cpu;

  const handleAssemble = (customCode?: string) => {
    setIsRunning(false);
    const codeToCompile = customCode ?? source;
    const res = assemble68HC11(codeToCompile);
    setCompiled(res);
    setCpu(createInitialCpu(res.lines[0]?.addr ?? 0x2000));
  };

  const stepCpu = () => {
    setCpu((prev) => {
      if (prev.halted) return prev;
      const lineIdx = compiled.lines.findIndex((l) => l.addr === prev.pc);
      if (lineIdx === -1) {
        return { ...prev, halted: true, lastLog: 'Fin du programme atteinte.' };
      }
      const line = compiled.lines[lineIdx];
      const nextPcDefault = compiled.lines[lineIdx + 1]?.addr ?? (prev.pc + 2) & 0xffff;
      const next: Cpu68State = {
        ...prev,
        ram: { ...prev.ram },
        pc: nextPcDefault,
        steps: prev.steps + 1,
      };

      const resolveOperand = (argStr: string): { isImm: boolean; val: number } => {
        const t = argStr.trim();
        if (t.startsWith('#')) {
          return { isImm: true, val: parseNumber68(t.slice(1), compiled.symbols) ?? 0 };
        }
        return { isImm: false, val: parseNumber68(t, compiled.symbols) ?? 0 };
      };

      const { op, arg } = line;
      const oper = resolveOperand(arg);
      const readMem = (addr: number) => next.ram[addr & 0xffff] ?? 0;

      switch (op) {
        case 'LDAA': {
          const val = (oper.isImm ? oper.val : readMem(oper.val)) & 0xff;
          next.a = val;
          next.ccr = updateNZC(next.ccr, val, undefined, false);
          next.lastLog = `LDAA : A ← $${val.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'LDAB': {
          const val = (oper.isImm ? oper.val : readMem(oper.val)) & 0xff;
          next.b = val;
          next.ccr = updateNZC(next.ccr, val, undefined, false);
          next.lastLog = `LDAB : B ← $${val.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'LDD': {
          const val16 = (oper.isImm ? oper.val : (readMem(oper.val) << 8) | readMem(oper.val + 1)) & 0xffff;
          next.a = (val16 >> 8) & 0xff;
          next.b = val16 & 0xff;
          next.lastLog = `LDD : D ← $${val16.toString(16).toUpperCase().padStart(4, '0')}`;
          break;
        }
        case 'LDX': {
          next.x = (oper.isImm ? oper.val : (readMem(oper.val) << 8) | readMem(oper.val + 1)) & 0xffff;
          next.lastLog = `LDX : IX ← $${next.x.toString(16).toUpperCase().padStart(4, '0')}`;
          break;
        }
        case 'LDY': {
          next.y = (oper.isImm ? oper.val : (readMem(oper.val) << 8) | readMem(oper.val + 1)) & 0xffff;
          next.lastLog = `LDY : IY ← $${next.y.toString(16).toUpperCase().padStart(4, '0')}`;
          break;
        }
        case 'STAA': {
          next.ram[oper.val] = next.a & 0xff;
          next.ccr = updateNZC(next.ccr, next.a, undefined, false);
          next.lastLog = `STAA : ($${oper.val.toString(16).toUpperCase().padStart(4, '0')}) ← A ($${next.a.toString(16).toUpperCase().padStart(2, '0')})`;
          break;
        }
        case 'STAB': {
          next.ram[oper.val] = next.b & 0xff;
          next.ccr = updateNZC(next.ccr, next.b, undefined, false);
          next.lastLog = `STAB : ($${oper.val.toString(16).toUpperCase().padStart(4, '0')}) ← B`;
          break;
        }
        case 'ADDA': {
          const rhs = (oper.isImm ? oper.val : readMem(oper.val)) & 0xff;
          const sum = next.a + rhs;
          next.a = sum & 0xff;
          next.ccr = updateNZC(next.ccr, next.a, sum > 0xff);
          next.lastLog = `ADDA : A ← $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'ADDB': {
          const rhs = (oper.isImm ? oper.val : readMem(oper.val)) & 0xff;
          const sum = next.b + rhs;
          next.b = sum & 0xff;
          next.ccr = updateNZC(next.ccr, next.b, sum > 0xff);
          next.lastLog = `ADDB : B ← $${next.b.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'SUBA': {
          const rhs = (oper.isImm ? oper.val : readMem(oper.val)) & 0xff;
          const diff = next.a - rhs;
          next.a = diff & 0xff;
          next.ccr = updateNZC(next.ccr, next.a, diff < 0);
          next.lastLog = `SUBA : A ← $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'INCA': {
          next.a = (next.a + 1) & 0xff;
          next.ccr = updateNZC(next.ccr, next.a);
          next.lastLog = `INCA : A = $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'DECA': {
          next.a = (next.a - 1) & 0xff;
          next.ccr = updateNZC(next.ccr, next.a);
          next.lastLog = `DECA : A = $${next.a.toString(16).toUpperCase().padStart(2, '0')} (Z=${next.a === 0 ? 1 : 0})`;
          break;
        }
        case 'ANDA': {
          const rhs = (oper.isImm ? oper.val : readMem(oper.val)) & 0xff;
          next.a &= rhs;
          next.ccr = updateNZC(next.ccr, next.a);
          next.lastLog = `ANDA : A = $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'ORAA': {
          const rhs = (oper.isImm ? oper.val : readMem(oper.val)) & 0xff;
          next.a |= rhs;
          next.ccr = updateNZC(next.ccr, next.a);
          next.lastLog = `ORAA : A = $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'EORA': {
          const rhs = (oper.isImm ? oper.val : readMem(oper.val)) & 0xff;
          next.a ^= rhs;
          next.ccr = updateNZC(next.ccr, next.a);
          next.lastLog = `EORA : A = $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'ASLA':
        case 'LSLA': {
          const c = (next.a & 0x80) !== 0;
          next.a = (next.a << 1) & 0xff;
          next.ccr = updateNZC(next.ccr, next.a, c);
          next.lastLog = `${op} : A = $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'LSRA': {
          const c = (next.a & 0x01) !== 0;
          next.a = (next.a >> 1) & 0xff;
          next.ccr = updateNZC(next.ccr, next.a, c);
          next.lastLog = `LSRA : A = $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'COMA': {
          next.a = ~next.a & 0xff;
          next.ccr = updateNZC(next.ccr, next.a, true);
          next.lastLog = `COMA : A = $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'BSET':
        case 'BCLR': {
          const [targetTok, maskTok] = arg.split(',').map((s) => s.trim());
          const addr = parseNumber68(targetTok ?? '', compiled.symbols) ?? 0;
          const cleanMask = (maskTok ?? '').replace(/^#/, '');
          const mask = (parseNumber68(cleanMask, compiled.symbols) ?? 0) & 0xff;
          const curr = readMem(addr);
          next.ram[addr] = op === 'BSET' ? curr | mask : curr & ~mask;
          next.lastLog = `${op} ($${addr.toString(16).toUpperCase()}) avec masque $${mask.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'PHA':
        case 'PSHA': {
          next.ram[next.sp] = next.a & 0xff;
          next.sp = (next.sp - 1) & 0xffff;
          next.lastLog = `PSHA : A empilé, SP = $${next.sp.toString(16).toUpperCase().padStart(4, '0')}`;
          break;
        }
        case 'PLA':
        case 'PULA': {
          next.sp = (next.sp + 1) & 0xffff;
          next.a = readMem(next.sp);
          next.lastLog = `PULA : A restauré = $${next.a.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'CLC':
          next.ccr &= ~0x01;
          next.lastLog = 'CLC : Carry C = 0';
          break;
        case 'SEC':
          next.ccr |= 0x01;
          next.lastLog = 'SEC : Carry C = 1';
          break;
        case 'BRA':
        case 'JMP': {
          const target = compiled.labels[arg.toUpperCase()];
          if (target !== undefined) next.pc = target;
          next.lastLog = `${op} → ${arg}`;
          break;
        }
        case 'BNE': {
          const z = (prev.ccr & 0x04) !== 0;
          const target = compiled.labels[arg.toUpperCase()];
          if (!z && target !== undefined) next.pc = target;
          next.lastLog = `BNE ${arg} (${!z ? 'saut pris' : 'saut ignoré, Z=1'})`;
          break;
        }
        case 'BEQ': {
          const z = (prev.ccr & 0x04) !== 0;
          const target = compiled.labels[arg.toUpperCase()];
          if (z && target !== undefined) next.pc = target;
          next.lastLog = `BEQ ${arg} (${z ? 'saut pris' : 'ignoré'})`;
          break;
        }
        case 'BCC': {
          const c = (prev.ccr & 0x01) !== 0;
          const target = compiled.labels[arg.toUpperCase()];
          if (!c && target !== undefined) next.pc = target;
          next.lastLog = `BCC ${arg}`;
          break;
        }
        case 'BCS': {
          const c = (prev.ccr & 0x01) !== 0;
          const target = compiled.labels[arg.toUpperCase()];
          if (c && target !== undefined) next.pc = target;
          next.lastLog = `BCS ${arg}`;
          break;
        }
        case 'NOP':
          next.lastLog = 'NOP : 1 cycle à vide';
          break;
        case 'STOP':
        case 'SWI':
        case 'END':
          next.halted = true;
          next.pc = line.addr;
          next.lastLog = `${op} : Programme terminé proprement.`;
          break;
        default:
          next.lastLog = `Instruction exécutée : ${line.op} ${line.arg}`;
      }

      return next;
    });
  };

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      if (cpuRef.current.halted || cpuRef.current.steps > 200) {
        setIsRunning(false);
        return;
      }
      stepCpu();
    }, 360);
    return () => window.clearInterval(id);
  });

  const activeLine = compiled.lines.find((l) => l.addr === cpu.pc);
  const portB = cpu.ram[0x1004] ?? 0;
  const portC = cpu.ram[0x1003] ?? 0;
  const regD = ((cpu.a & 0xff) << 8) | (cpu.b & 0xff);

  const togglePortCBit = (bit: number) => {
    setCpu((prev) => ({
      ...prev,
      ram: { ...prev.ram, 0x1003: (prev.ram[0x1003] ?? 0) ^ (1 << bit) },
    }));
  };

  const ccrFlags = useMemo(
    () => [
      { bit: 7, name: 'S' },
      { bit: 6, name: 'X' },
      { bit: 5, name: 'H' },
      { bit: 4, name: 'I' },
      { bit: 3, name: 'N' },
      { bit: 2, name: 'Z' },
      { bit: 1, name: 'V' },
      { bit: 0, name: 'C' },
    ],
    [],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <header className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Laboratoire CISC Interactif</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
          Simulateur & Assembleur Motorola 68HC11
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Écris ton programme assembleur, assemble-le et observe les registres A/B/D, le CCR et les LEDs de PORTB pas à pas.
        </p>
      </header>

      {/* Presets du cours */}
      <div className="flex flex-wrap gap-2">
        {PRESETS_68HC11.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              setSource(preset.code);
              handleAssemble(preset.code);
            }}
            className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-500 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors"
            title={preset.desc}
          >
            {preset.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Éditeur Assembleur */}
        <div
          className={`${
            editorWide ? 'lg:col-span-12' : 'lg:col-span-6'
          } rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col`}
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Code Source (.ASM 68HC11)
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <div
                className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-[11px]"
                role="group"
                aria-label="Taille de la fenêtre de code"
              >
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'grand', label: 'Grand' },
                  { id: 'xl', label: 'Très grand' },
                ].map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setEditorHeight(sz.id as 'normal' | 'grand' | 'xl')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors ${
                      editorHeight === sz.id
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setEditorWide((w) => !w)}
                title={editorWide ? 'Revenir en 2 colonnes' : 'Élargir la fenêtre sur toute la largeur'}
                className="min-h-[32px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 inline-flex items-center gap-1"
              >
                {editorWide ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{editorWide ? 'Réduire' : 'Élargir'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleAssemble()}
                className="min-h-[34px] px-3 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
              >
                Assembler & Charger
              </button>
            </div>
          </div>

          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            rows={editorHeight === 'xl' ? 32 : editorHeight === 'grand' ? 24 : 18}
            className={`w-full flex-1 ${
              editorHeight === 'xl'
                ? 'min-h-[680px]'
                : editorHeight === 'grand'
                  ? 'min-h-[520px]'
                  : 'min-h-[390px]'
            } p-4 font-mono text-xs sm:text-sm bg-slate-950 text-sky-100 focus:outline-none leading-relaxed resize-y transition-all`}
          />

          {compiled.errors.length > 0 && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 space-y-1">
              {compiled.errors.map((err) => (
                <div key={err} className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Barre d'exécution */}
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 bg-slate-50 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setIsRunning((r) => !r)}
              className="min-h-[44px] px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause' : 'Exécuter'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                stepCpu();
              }}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <SkipForward className="w-4 h-4" />
              <span>Pas à pas</span>
            </button>
            <button
              type="button"
              onClick={() => handleAssemble()}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset CPU</span>
            </button>
          </div>
        </div>

        {/* Panneau Registres + Maquette Matérielle */}
        <div className={`${editorWide ? 'lg:col-span-12' : 'lg:col-span-6'} space-y-4`}>
          {/* Trace ligne active */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Instruction en cours (Ligne {activeLine?.lineNo ?? '—'})</span>
              <span className="font-mono tabular-nums">Cycles/Pas : {cpu.steps}</span>
            </div>
            <div className="font-mono text-sm font-semibold text-sky-700 dark:text-sky-400">
              {cpu.lastLog}
            </div>
          </div>

          {/* Registres internes */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
            <h2 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
              Registres internes 68HC11
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 font-mono">
              {[
                { name: 'A (8b)', val: `$${cpu.a.toString(16).toUpperCase().padStart(2, '0')}` },
                { name: 'B (8b)', val: `$${cpu.b.toString(16).toUpperCase().padStart(2, '0')}` },
                { name: 'D (A:B)', val: `$${regD.toString(16).toUpperCase().padStart(4, '0')}` },
                { name: 'PC', val: `$${cpu.pc.toString(16).toUpperCase().padStart(4, '0')}` },
                { name: 'IX', val: `$${cpu.x.toString(16).toUpperCase().padStart(4, '0')}` },
                { name: 'IY', val: `$${cpu.y.toString(16).toUpperCase().padStart(4, '0')}` },
                { name: 'SP', val: `$${cpu.sp.toString(16).toUpperCase().padStart(4, '0')}` },
                { name: 'RAM($60)', val: `$${(cpu.ram[0x60] ?? 0).toString(16).toUpperCase().padStart(2, '0')}` },
              ].map((reg) => (
                <div
                  key={reg.name}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2.5"
                >
                  <div className="text-[11px] text-slate-500">{reg.name}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {reg.val}
                  </div>
                </div>
              ))}
            </div>

            {/* CCR Flags */}
            <div className="pt-1">
              <div className="text-[11px] text-slate-500 mb-1.5">
                Registre d’état CCR (S X H I N Z V C)
              </div>
              <div className="grid grid-cols-8 gap-1.5 font-mono text-center">
                {ccrFlags.map((f) => {
                  const on = (cpu.ccr & (1 << f.bit)) !== 0;
                  return (
                    <div
                      key={f.name}
                      className={`rounded-lg py-1.5 border text-xs font-bold ${
                        on
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div>{f.name}</div>
                      <div className="text-[10px] opacity-80">{on ? '1' : '0'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Maquette LEDs PORTB + Interrupteurs PORTC */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-sm">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span>Sortie LEDs · PORTB ($1004)</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                  ${portB.toString(16).toUpperCase().padStart(2, '0')} · %{portB.toString(2).padStart(8, '0')}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                  const on = (portB & (1 << bit)) !== 0;
                  return (
                    <div key={bit} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          on
                            ? 'bg-rose-500 border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.75)]'
                            : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      />
                      <span className="font-mono text-[10px] text-slate-500">PB{bit}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span>Entrées Switches · PORTC ($1003)</span>
                <span className="font-mono text-sky-700 dark:text-sky-400">
                  ${portC.toString(16).toUpperCase().padStart(2, '0')}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                  const on = (portC & (1 << bit)) !== 0;
                  return (
                    <button
                      key={bit}
                      type="button"
                      onClick={() => togglePortCBit(bit)}
                      className={`min-h-[40px] rounded-lg font-mono text-[11px] font-bold border transition-colors ${
                        on
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      PC{bit}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Convertisseur Bin / Hex / Déc */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <ArrowLeftRight className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Convertisseur rapide Décimal ↔ Hexadécimal ↔ Binaire (8/16 bits)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <label className="space-y-1 text-xs">
            <span className="text-slate-500">Décimal (0–65535)</span>
            <input
              type="number"
              min={0}
              max={65535}
              value={convNum}
              onChange={(e) => setConvNum(Math.min(65535, Math.max(0, Number(e.target.value) || 0)))}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </label>
          <div className="space-y-1 text-xs">
            <span className="text-slate-500">Hexadécimal ($ / 0x)</span>
            <div className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center font-bold text-sky-700 dark:text-sky-400">
              ${convNum.toString(16).toUpperCase().padStart(convNum > 255 ? 4 : 2, '0')}
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <span className="text-slate-500">Binaire (%)</span>
            <div className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center font-bold text-emerald-700 dark:text-emerald-400 overflow-x-auto">
              %{convNum.toString(2).padStart(8, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
