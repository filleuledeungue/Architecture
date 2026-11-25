import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Eye,
  ShieldQuestion,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface PresetPic {
  id: string;
  title: string;
  desc: string;
  code: string;
}

export const TP1_CORRECTION_CODE = `; Correction commentée TP1 L2GE : 4 LEDs (RD0..RD3) / 4 Boutons (RA0..RA3)
        ORG 0x0000
        ; 1. Banque 3 (RP1=1, RP0=1) : passer PORTA en numérique
        BSF STATUS, RP1
        BSF STATUS, RP0
        CLRF ANSEL
        ; 2. Banque 1 (RP1=0, RP0=1) : RA0-RA3 entrées, RD0-RD3 sorties
        BCF STATUS, RP1
        BSF STATUS, RP0
        MOVLW B'00001111'
        MOVWF TRISA
        CLRF TRISD
        ; 3. Banque 0 (RP1=0, RP0=0) : lecture PORTA -> masque -> PORTD
        BCF STATUS, RP0
BOUCLE: MOVF PORTA, W
        ANDLW 0x0F
        MOVWF PORTD
        GOTO BOUCLE`;

export const PRESETS_PIC16F887: PresetPic[] = [
  {
    id: 'tp1-squelette',
    title: 'TP1 L2GE : Squelette à compléter',
    desc: 'À toi de jouer ! Complète les 3 banques pour allumer les LEDs RD0–RD3 selon les boutons RA0–RA3.',
    code: `; TP1 ESP L2GE : Allumer LED i (RD0..RD3) selon Bouton i (RA0..RA3)
; Complète chaque TODO ci-dessous puis clique sur « Assembler & Charger ».
        ORG 0x0000

        ; --- ÉTAPE 1 : Banque 3 (RP1=1, RP0=1) ---
        ; TODO : Ouvre la Banque 3 avec BSF sur STATUS (RP1 et RP0)
        ; TODO : Passe PORTA en numérique en mettant ANSEL à zéro

        ; --- ÉTAPE 2 : Banque 1 (RP1=0, RP0=1) ---
        ; TODO : Passe en Banque 1 (RP1=0, RP0=1)
        ; TODO : Configure RA0..RA3 en entrées dans TRISA (0x0F)
        ; TODO : Configure RD0..RD3 en sorties dans TRISD (0x00)

        ; --- ÉTAPE 3 : Banque 0 (RP1=0, RP0=0) ---
        ; TODO : Reviens en Banque 0 (RP0=0)
BOUCLE:
        ; TODO : Copie PORTA dans W (MOVF)
        ; TODO : Garde uniquement les 4 bits RA0..RA3 (ANDLW)
        ; TODO : Envoie W vers PORTD (MOVWF)
        GOTO BOUCLE`,
  },
  {
    id: 'tp3-squelette',
    title: 'TP3 L2GE : Carrefour (Squelette)',
    desc: 'Squelette guidé pour tester le mode Jour/Nuit (RD0) avec BTFSC et piloter les feux.',
    code: `; TP3 ESP L2GE : Feux de carrefour (Mode Jour si RD0=0 / Mode Nuit si RD0=1)
        ORG 0x0000
        ; TODO : Banque 3 -> ANSEL = 0x00, ANSELH = 0x00
        ; TODO : Banque 1 -> PORTA & PORTC en sorties, RD0 en entrée (TRISD = 0x01)
        ; TODO : Banque 0 -> Effacer PORTA et PORTC

MAIN:
        ; TODO : Tester le bit 0 de PORTD (BTFSC PORTD, 0)
        GOTO MODE_JOUR
        GOTO MODE_NUIT

MODE_JOUR:
        ; TODO : Allumer Vert A + Rouge B, puis Orange A + Rouge B, etc.
        GOTO MAIN

MODE_NUIT:
        ; TODO : Faire clignoter les feux Orange sur Voie A et Voie B
        GOTO MAIN`,
  },
  {
    id: 'bank-error-demo',
    title: 'Démo : Oubli de Banque !',
    desc: 'Montre l’alerte pédagogique si on écrit TRISD sans quitter la Banque 0.',
    code: `; Erreur classique : oublier BSF STATUS, RP0 avant TRISD !
        ORG 0x0000
        MOVLW 0x55
        MOVWF TRISD    ; ERREUR : on est en Banque 0 -> écrit dans PORTD !
        BSF STATUS, RP0 ; Maintenant Banque 1 ouverte
        CLRF TRISD     ; OK : TRISD configuré en sortie
        BCF STATUS, RP0
        MOVLW 0x0F
        MOVWF PORTD
        END`,
  },
  {
    id: 'indirect-fsr',
    title: 'Démo : Adressage indirect (FSR/INDF)',
    desc: 'Remplit les cases RAM 0x20..0x23 via le pointeur FSR et INDF.',
    code: `; Remplir 4 octets en RAM avec FSR / INDF
        ORG 0x0000
        MOVLW 0x20
        MOVWF FSR      ; FSR pointe sur 0x20
        MOVLW .4
        MOVWF 0x70     ; Compteur en zone commune 70h
NEXT:   MOVF 0x70, W
        MOVWF INDF     ; Écrit à l'adresse pointée par FSR
        INCF FSR, F
        DECFSZ 0x70, F
        GOTO NEXT
        END`,
  },
  {
    id: 'bac-a-sable',
    title: 'Bac à sable vierge',
    desc: 'Page blanche prête pour tes propres essais d’assembleur MPASM.',
    code: `; Ton programme PIC16F887 ici
        ORG 0x0000

        END`,
  },
];

interface ParsedPicLine {
  lineNo: number;
  pc: number;
  op: string;
  arg1: string;
  arg2: string;
}

interface PicState {
  w: number;
  status: number; // bit6=RP1, bit5=RP0, bit2=Z, bit1=DC, bit0=C
  fsr: number;
  pc: number;
  ram: Record<number, number>; // adresses complètes 0x000..0x1FF
  stack: number[];
  steps: number;
  halted: boolean;
  lastLog: string;
  bankWarning: string | null;
}

function parsePicNumber(tok: string, symbols: Record<string, number>): number | null {
  const s = tok.trim();
  if (!s) return null;
  const upper = s.toUpperCase();
  if (symbols[upper] !== undefined) return symbols[upper];
  if (/^0X[0-9A-F]+$/i.test(s)) return parseInt(s.slice(2), 16);
  if (/^[0-9A-F]+H$/i.test(s)) return parseInt(s.slice(0, -1), 16);
  if (/^B'[01]+'$/i.test(s)) return parseInt(s.slice(2, -1), 2);
  if (/^\.[0-9]+$/.test(s)) return parseInt(s.slice(1), 10);
  if (/^[0-9]+$/.test(s)) return parseInt(s, 10);
  return null;
}

const PIC_BASE_SYMBOLS: Record<string, number> = {
  INDF: 0x00,
  STATUS: 0x03,
  FSR: 0x04,
  PORTA: 0x05,
  PORTB: 0x06,
  PORTC: 0x07,
  PORTD: 0x08,
  PORTE: 0x09,
  TRISA: 0x85,
  TRISB: 0x86,
  TRISC: 0x87,
  TRISD: 0x88,
  TRISE: 0x89,
  ANSEL: 0x188,
  ANSELH: 0x189,
  RP0: 5,
  RP1: 6,
  C: 0,
  DC: 1,
  Z: 2,
};

function assemblePic(source: string): {
  lines: ParsedPicLine[];
  labels: Record<string, number>;
  symbols: Record<string, number>;
} {
  const symbols: Record<string, number> = { ...PIC_BASE_SYMBOLS };
  const labels: Record<string, number> = {};
  const lines: ParsedPicLine[] = [];
  let pc = 0;

  for (const [idx, raw] of source.split('\n').entries()) {
    const clean = raw.split(';')[0].trim();
    if (!clean) continue;

    const equ = clean.match(/^([A-Za-z_]\w*)\s+EQU\s+(.+)$/i);
    if (equ) {
      const val = parsePicNumber(equ[2], symbols);
      if (val !== null) symbols[equ[1].toUpperCase()] = val;
      continue;
    }

    const org = clean.match(/^ORG\s+(.+)$/i);
    if (org) {
      const val = parsePicNumber(org[1], symbols);
      if (val !== null) pc = val;
      continue;
    }

    let rest = clean;
    const lbl = rest.match(/^([A-Za-z_]\w*):\s*(.*)$/);
    if (lbl) {
      labels[lbl[1].toUpperCase()] = pc;
      rest = lbl[2].trim();
      if (!rest) continue;
    }

    const firstSpace = rest.search(/\s/);
    const op = (firstSpace === -1 ? rest : rest.slice(0, firstSpace)).toUpperCase();
    const argsRaw = firstSpace === -1 ? '' : rest.slice(firstSpace + 1).trim();
    const [a1 = '', a2 = ''] = argsRaw.split(',').map((x) => x.trim());
    lines.push({ lineNo: idx + 1, pc, op, arg1: a1, arg2: a2 });
    pc += 1;
  }

  return { lines, labels, symbols };
}

function createInitialPicState(startPc: number): PicState {
  return {
    w: 0,
    status: 0x18, // RP1=0, RP0=0 (Banque 0)
    fsr: 0,
    pc: startPc,
    ram: {
      0x05: 0x05, // RA0 et RA2 appuyés par défaut pour tester TP1
      0x08: 0x00,
      0x85: 0xff,
      0x88: 0xff,
      0x188: 0xff, // Analogique par défaut au Reset
      0x189: 0xff,
    },
    stack: [],
    steps: 0,
    halted: false,
    lastLog: 'Prêt : complète le code puis clique sur « Assembler & Charger ».',
    bankWarning: null,
  };
}

/**
 * Labo complet PIC16F887 : Assembleur + Émulateur + Armoire 4 Banques + Assistant Vérificateur TP1 sans spoiler
 */
export const LabPIC16F887: React.FC<{ initialPresetId?: string }> = ({ initialPresetId }) => {
  const resolveInitialCode = (presetId?: string) => {
    if (presetId === 'tp1-correction') return TP1_CORRECTION_CODE;
    return (PRESETS_PIC16F887.find((p) => p.id === presetId) ?? PRESETS_PIC16F887[0]).code;
  };

  const [activePresetId, setActivePresetId] = useState<string>(
    initialPresetId ?? PRESETS_PIC16F887[0].id,
  );
  const [source, setSource] = useState(() => resolveInitialCode(initialPresetId));
  const [compiled, setCompiled] = useState(() => assemblePic(resolveInitialCode(initialPresetId)));
  const [pic, setPic] = useState<PicState>(() =>
    createInitialPicState(compiled.lines[0]?.pc ?? 0),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [editorHeight, setEditorHeight] = useState<'normal' | 'grand' | 'xl'>('normal');
  const [editorWide, setEditorWide] = useState(false);

  // Double confirmation avant d'afficher une correction dans le labo
  const [confirmCorrectionStep, setConfirmCorrectionStep] = useState<'idle' | 'confirm'>('idle');

  const picRef = useRef(pic);
  picRef.current = pic;

  useEffect(() => {
    if (!initialPresetId) return;
    const code = resolveInitialCode(initialPresetId);
    setActivePresetId(initialPresetId);
    setSource(code);
    const res = assemblePic(code);
    setCompiled(res);
    setPic(createInitialPicState(res.lines[0]?.pc ?? 0));
    setIsRunning(false);
    setConfirmCorrectionStep('idle');
  }, [initialPresetId]);

  const handleAssemble = (customCode?: string) => {
    setIsRunning(false);
    const code = customCode ?? source;
    const res = assemblePic(code);
    setCompiled(res);
    setPic(createInitialPicState(res.lines[0]?.pc ?? 0));
  };

  const stepPic = () => {
    setPic((prev) => {
      if (prev.halted) return prev;
      const idx = compiled.lines.findIndex((l) => l.pc === prev.pc);
      if (idx === -1) {
        return { ...prev, halted: true, lastLog: 'Fin du programme atteinte.' };
      }

      const line = compiled.lines[idx];
      const nextPcDefault = compiled.lines[idx + 1]?.pc ?? prev.pc + 1;
      const next: PicState = {
        ...prev,
        ram: { ...prev.ram },
        stack: [...prev.stack],
        pc: nextPcDefault,
        steps: prev.steps + 1,
        bankWarning: null,
      };

      const rp1 = (prev.status & 0x40) !== 0 ? 1 : 0;
      const rp0 = (prev.status & 0x20) !== 0 ? 1 : 0;
      const activeBank = (rp1 << 1) | rp0;

      const resolveFileAddr = (tok: string): number => {
        const upper = tok.toUpperCase();
        const rawSym = parsePicNumber(tok, compiled.symbols) ?? 0;
        const offset7 = rawSym & 0x7f;

        if (upper.startsWith('TRIS') && activeBank !== 1) {
          next.bankWarning = `Erreur de tiroir ! Tu accèdes à ${upper} alors que RP1:RP0 = ${rp1}${rp0} (Banque ${activeBank}). TRISx se trouve en Banque 1 (RP1=0, RP0=1) !`;
        } else if ((upper === 'ANSEL' || upper === 'ANSELH') && activeBank !== 3) {
          next.bankWarning = `Erreur de tiroir ! ${upper} est en Banque 3 (RP1=1, RP0=1), mais tu es en Banque ${activeBank}.`;
        } else if (upper.startsWith('PORT') && activeBank !== 0 && activeBank !== 2) {
          next.bankWarning = `Attention ! ${upper} est en Banque 0 (RP1=0, RP0=0), mais tu es en Banque ${activeBank}.`;
        }

        if (offset7 >= 0x70 || offset7 === 0x03 || offset7 === 0x04 || offset7 === 0x00) {
          return offset7;
        }
        return (activeBank << 7) | offset7;
      };

      const readFile = (addr: number): number => {
        if (addr === 0x03) return next.status;
        if (addr === 0x04) return next.fsr;
        if (addr === 0x00) return next.ram[next.fsr] ?? 0;
        return next.ram[addr] ?? 0;
      };

      const writeFile = (addr: number, val: number) => {
        const v = val & 0xff;
        if (addr === 0x03) {
          next.status = v;
        } else if (addr === 0x04) {
          next.fsr = v;
        } else if (addr === 0x00) {
          next.ram[next.fsr] = v;
        } else {
          next.ram[addr] = v;
        }
      };

      const setZ = (v: number) => {
        next.status = (v & 0xff) === 0 ? next.status | 0x04 : next.status & ~0x04;
      };

      const isDestW = line.arg2.toUpperCase() === 'W' || line.arg2 === '0';
      const { op, arg1, arg2 } = line;

      switch (op) {
        case 'MOVLW': {
          next.w = (parsePicNumber(arg1, compiled.symbols) ?? 0) & 0xff;
          next.lastLog = `MOVLW : W ← 0x${next.w.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'MOVWF': {
          const addr = resolveFileAddr(arg1);
          writeFile(addr, next.w);
          next.lastLog = `MOVWF ${arg1} (0x${addr.toString(16).toUpperCase()}) ← W`;
          break;
        }
        case 'MOVF': {
          const addr = resolveFileAddr(arg1);
          const v = readFile(addr);
          setZ(v);
          if (isDestW) next.w = v;
          else writeFile(addr, v);
          next.lastLog = `MOVF ${arg1}, ${isDestW ? 'W' : 'F'} (= 0x${v.toString(16).toUpperCase().padStart(2, '0')})`;
          break;
        }
        case 'CLRF': {
          const addr = resolveFileAddr(arg1);
          writeFile(addr, 0);
          setZ(0);
          next.lastLog = `CLRF ${arg1} (0x${addr.toString(16).toUpperCase()}) ← 0x00`;
          break;
        }
        case 'CLRW':
          next.w = 0;
          setZ(0);
          next.lastLog = 'CLRW : W ← 0x00';
          break;
        case 'ADDLW': {
          const lit = (parsePicNumber(arg1, compiled.symbols) ?? 0) & 0xff;
          const sum = next.w + lit;
          next.w = sum & 0xff;
          setZ(next.w);
          next.status = sum > 0xff ? next.status | 1 : next.status & ~1;
          next.lastLog = `ADDLW : W ← 0x${next.w.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'SUBLW': {
          const lit = (parsePicNumber(arg1, compiled.symbols) ?? 0) & 0xff;
          const diff = lit - next.w;
          next.w = diff & 0xff;
          setZ(next.w);
          next.status = diff >= 0 ? next.status | 1 : next.status & ~1;
          next.lastLog = `SUBLW : W ← 0x${next.w.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'ANDLW': {
          const lit = (parsePicNumber(arg1, compiled.symbols) ?? 0) & 0xff;
          next.w &= lit;
          setZ(next.w);
          next.lastLog = `ANDLW : W ← 0x${next.w.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'IORLW': {
          const lit = (parsePicNumber(arg1, compiled.symbols) ?? 0) & 0xff;
          next.w |= lit;
          setZ(next.w);
          next.lastLog = `IORLW : W ← 0x${next.w.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'XORLW': {
          const lit = (parsePicNumber(arg1, compiled.symbols) ?? 0) & 0xff;
          next.w ^= lit;
          setZ(next.w);
          next.lastLog = `XORLW : W ← 0x${next.w.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'ADDWF': {
          const addr = resolveFileAddr(arg1);
          const sum = next.w + readFile(addr);
          const res = sum & 0xff;
          setZ(res);
          next.status = sum > 0xff ? next.status | 1 : next.status & ~1;
          if (isDestW) next.w = res;
          else writeFile(addr, res);
          next.lastLog = `ADDWF ${arg1}, ${isDestW ? 'W' : 'F'} → 0x${res.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'INCF': {
          const addr = resolveFileAddr(arg1);
          const v = (readFile(addr) + 1) & 0xff;
          setZ(v);
          if (isDestW) next.w = v;
          else writeFile(addr, v);
          next.lastLog = `INCF ${arg1} → 0x${v.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'DECF': {
          const addr = resolveFileAddr(arg1);
          const v = (readFile(addr) - 1) & 0xff;
          setZ(v);
          if (isDestW) next.w = v;
          else writeFile(addr, v);
          next.lastLog = `DECF ${arg1} → 0x${v.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'SWAPF': {
          const addr = resolveFileAddr(arg1);
          const raw = readFile(addr);
          const v = ((raw & 0x0f) << 4) | ((raw & 0xf0) >> 4);
          if (isDestW) next.w = v;
          else writeFile(addr, v);
          next.lastLog = `SWAPF ${arg1} → 0x${v.toString(16).toUpperCase().padStart(2, '0')}`;
          break;
        }
        case 'DECFSZ': {
          const addr = resolveFileAddr(arg1);
          const v = (readFile(addr) - 1) & 0xff;
          if (isDestW) next.w = v;
          else writeFile(addr, v);
          if (v === 0) {
            next.pc = compiled.lines[idx + 2]?.pc ?? next.pc + 1;
            next.lastLog = `DECFSZ ${arg1} = 0 → saute l’instruction suivante !`;
          } else {
            next.lastLog = `DECFSZ ${arg1} = ${v} → continue`;
          }
          break;
        }
        case 'INCFSZ': {
          const addr = resolveFileAddr(arg1);
          const v = (readFile(addr) + 1) & 0xff;
          if (isDestW) next.w = v;
          else writeFile(addr, v);
          if (v === 0) {
            next.pc = compiled.lines[idx + 2]?.pc ?? next.pc + 1;
            next.lastLog = `INCFSZ ${arg1} = 0 → saute l’instruction suivante !`;
          } else {
            next.lastLog = `INCFSZ ${arg1} = ${v} → continue`;
          }
          break;
        }
        case 'BSF': {
          const addr = resolveFileAddr(arg1);
          const bit = (parsePicNumber(arg2, compiled.symbols) ?? 0) & 7;
          writeFile(addr, readFile(addr) | (1 << bit));
          next.lastLog = `BSF ${arg1}, ${arg2} (bit ${bit} mis à 1)`;
          break;
        }
        case 'BCF': {
          const addr = resolveFileAddr(arg1);
          const bit = (parsePicNumber(arg2, compiled.symbols) ?? 0) & 7;
          writeFile(addr, readFile(addr) & ~(1 << bit));
          next.lastLog = `BCF ${arg1}, ${arg2} (bit ${bit} mis à 0)`;
          break;
        }
        case 'BTFSC': {
          const addr = resolveFileAddr(arg1);
          const bit = (parsePicNumber(arg2, compiled.symbols) ?? 0) & 7;
          const isZero = (readFile(addr) & (1 << bit)) === 0;
          if (isZero) {
            next.pc = compiled.lines[idx + 2]?.pc ?? next.pc + 1;
            next.lastLog = `BTFSC ${arg1}, ${bit} : bit = 0 → saute l’instruction suivante`;
          } else {
            next.lastLog = `BTFSC ${arg1}, ${bit} : bit = 1 → continue`;
          }
          break;
        }
        case 'BTFSS': {
          const addr = resolveFileAddr(arg1);
          const bit = (parsePicNumber(arg2, compiled.symbols) ?? 0) & 7;
          const isOne = (readFile(addr) & (1 << bit)) !== 0;
          if (isOne) {
            next.pc = compiled.lines[idx + 2]?.pc ?? next.pc + 1;
            next.lastLog = `BTFSS ${arg1}, ${bit} : bit = 1 → saute l’instruction suivante`;
          } else {
            next.lastLog = `BTFSS ${arg1}, ${bit} : bit = 0 → continue`;
          }
          break;
        }
        case 'GOTO': {
          const target = compiled.labels[arg1.toUpperCase()];
          if (target !== undefined) next.pc = target;
          next.lastLog = `GOTO ${arg1}`;
          break;
        }
        case 'CALL': {
          const target = compiled.labels[arg1.toUpperCase()];
          if (target !== undefined) {
            next.stack = [nextPcDefault, ...next.stack].slice(0, 8);
            next.pc = target;
          }
          next.lastLog = `CALL ${arg1}`;
          break;
        }
        case 'RETURN':
          next.pc = next.stack.shift() ?? nextPcDefault;
          next.lastLog = 'RETURN';
          break;
        case 'NOP':
          next.lastLog = 'NOP';
          break;
        case 'END':
          next.halted = true;
          next.pc = line.pc;
          next.lastLog = 'END : Fin du programme.';
          break;
        default:
          next.lastLog = `${op} ${arg1}`;
      }

      return next;
    });
  };

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      if (picRef.current.halted || picRef.current.steps > 240) {
        setIsRunning(false);
        return;
      }
      stepPic();
    }, 340);
    return () => window.clearInterval(id);
  });

  const rp1 = (pic.status & 0x40) !== 0 ? 1 : 0;
  const rp0 = (pic.status & 0x20) !== 0 ? 1 : 0;
  const activeBank = (rp1 << 1) | rp0;
  const portA = pic.ram[0x05] ?? 0;
  const portD = pic.ram[0x08] ?? 0;
  const trisA = pic.ram[0x85] ?? 0xff;
  const trisD = pic.ram[0x88] ?? 0xff;
  const ansel = pic.ram[0x188] ?? 0xff;

  // Vérification pas à pas du TP1 sans donner le code !
  const checkAnselOk = ansel === 0x00;
  const checkTrisAOk = (trisA & 0x0f) === 0x0f;
  const checkTrisDOk = (trisD & 0x0f) === 0x00;
  const checkLoopOk =
    checkAnselOk && checkTrisAOk && checkTrisDOk && (portD & 0x0f) === (portA & 0x0f);

  const toggleButtonRA = (bit: number) => {
    setPic((prev) => ({
      ...prev,
      ram: { ...prev.ram, 0x05: (prev.ram[0x05] ?? 0) ^ (1 << bit) },
    }));
  };

  const banks = [
    { id: 0, name: 'Banque 0', bits: 'RP1:RP0 = 00', regs: 'PORTA, PORTB, PORTC, PORTD, TMR0' },
    { id: 1, name: 'Banque 1', bits: 'RP1:RP0 = 01', regs: 'TRISA, TRISB, TRISC, TRISD, ADCON1' },
    { id: 2, name: 'Banque 2', bits: 'RP1:RP0 = 10', regs: 'EEDAT, EEADR, CM1CON0' },
    { id: 3, name: 'Banque 3', bits: 'RP1:RP0 = 11', regs: 'ANSEL (188h), ANSELH (189h)' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <header className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Laboratoire RISC Harvard & Banques</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
          Simulateur PIC16F887 & Armoire 4 Banques
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Complète les squelettes de TP par toi-même : l’assistant vérifie tes banques et tes registres en direct sans te souffler les réponses.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {PRESETS_PIC16F887.map((preset) => {
          const active = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setActivePresetId(preset.id);
                setSource(preset.code);
                handleAssemble(preset.code);
                setConfirmCorrectionStep('idle');
              }}
              className={`min-h-[42px] px-3.5 rounded-xl border text-xs font-semibold transition-colors ${
                active
                  ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-100'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-500 text-slate-800 dark:text-slate-100'
              }`}
              title={preset.desc}
            >
              {preset.title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Éditeur PIC */}
        <div
          className={`${
            editorWide ? 'lg:col-span-12' : 'lg:col-span-6'
          } rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col`}
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Code Source MPASM (PIC16F887)
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
            rows={editorHeight === 'xl' ? 34 : editorHeight === 'grand' ? 26 : 21}
            className={`w-full flex-1 ${
              editorHeight === 'xl'
                ? 'min-h-[720px]'
                : editorHeight === 'grand'
                  ? 'min-h-[560px]'
                  : 'min-h-[450px]'
            } p-4 font-mono text-xs sm:text-sm bg-slate-950 text-emerald-100 focus:outline-none leading-relaxed resize-y transition-all`}
          />

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
                stepPic();
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
              <span>Reset PIC</span>
            </button>
          </div>
        </div>

        {/* Armoire 4 Banques + Registres + Maquette TP1 + Vérificateur */}
        <div className={`${editorWide ? 'lg:col-span-12' : 'lg:col-span-6'} space-y-4`}>
          {/* Trace + Alerte erreur de banque */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-sm">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Instruction PC = 0x{pic.pc.toString(16).toUpperCase().padStart(4, '0')}</span>
              <span className="font-mono tabular-nums">Cycles Tcy : {pic.steps}</span>
            </div>
            <div className="font-mono text-sm font-semibold text-sky-700 dark:text-sky-400">
              {pic.lastLog}
            </div>
            {pic.bankWarning && (
              <div className="mt-2 rounded-xl border border-amber-400 bg-amber-50 dark:bg-amber-950/50 p-3 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{pic.bankWarning}</span>
              </div>
            )}
          </div>

          {/* Armoire 4 Banques visuelle */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
                Armoire à 4 Tiroirs (Banque active : {activeBank})
              </h2>
              <span className="font-mono text-xs text-sky-700 dark:text-sky-400 font-bold">
                RP1={rp1} · RP0={rp0}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {banks.map((b) => {
                const open = b.id === activeBank;
                return (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3 transition-all ${
                      open
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>
                        {open ? '📂 ' : '🗄️ '}
                        {b.name}
                      </span>
                      <span className="font-mono text-[11px]">{b.bits}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      {b.regs}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registres W, STATUS, FSR, ANSEL */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono shadow-sm">
            {[
              { label: 'W', val: `0x${pic.w.toString(16).toUpperCase().padStart(2, '0')}` },
              { label: 'STATUS', val: `0x${pic.status.toString(16).toUpperCase().padStart(2, '0')}` },
              { label: 'TRISA', val: `0x${trisA.toString(16).toUpperCase().padStart(2, '0')}` },
              { label: 'ANSEL', val: `0x${ansel.toString(16).toUpperCase().padStart(2, '0')}` },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2.5"
              >
                <div className="text-[11px] text-slate-500">{item.label}</div>
                <div className="text-sm font-bold tabular-nums">{item.val}</div>
              </div>
            ))}
          </div>

          {/* Maquette interactive TP1 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span>Maquette TP1 · Boutons (RA0–RA3) & LEDs (RD0–RD3)</span>
              <span className="font-mono text-slate-500">
                TRISD=0x{trisD.toString(16).toUpperCase().padStart(2, '0')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-[11px] text-slate-500">Boutons-poussoirs (Entrées)</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((bit) => {
                    const pressed = (portA & (1 << bit)) !== 0;
                    return (
                      <button
                        key={bit}
                        type="button"
                        onClick={() => toggleButtonRA(bit)}
                        className={`min-h-[42px] rounded-xl font-mono text-xs font-bold border transition-colors ${
                          pressed
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        RA{bit}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] text-slate-500">4 LEDs sur PORTD (Sorties)</div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[0, 1, 2, 3].map((bit) => {
                    const isOutput = (trisD & (1 << bit)) === 0;
                    const lit = isOutput && (portD & (1 << bit)) !== 0;
                    return (
                      <div key={bit} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            lit
                              ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                              : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        />
                        <span className="font-mono text-[10px] text-slate-500">RD{bit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Vérificateur automatique TP1 sans spoiler */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/70 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Vérificateur guidé TP1 (en direct)
              </div>
              {confirmCorrectionStep === 'idle' && activePresetId !== 'tp1-correction' && (
                <button
                  type="button"
                  onClick={() => setConfirmCorrectionStep('confirm')}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  <ShieldQuestion className="w-3.5 h-3.5" />
                  <span>Bloqué ? Demander la correction TP1</span>
                </button>
              )}
            </div>

            <ul className="space-y-1.5 text-xs">
              {[
                {
                  ok: checkAnselOk,
                  pass: '1. ANSEL = 0x00 (PORTA configuré en numérique)',
                  fail: '1. ANSEL ≠ 0x00 : pense à ouvrir la Banque 3 (RP1=1, RP0=1) pour effacer ANSEL.',
                },
                {
                  ok: checkTrisAOk,
                  pass: '2. TRISA (bits 0..3) = 1111 (RA0–RA3 en entrées)',
                  fail: '2. TRISA incomplet : en Banque 1, configure les 4 bits bas de TRISA à 1.',
                },
                {
                  ok: checkTrisDOk,
                  pass: '3. TRISD (bits 0..3) = 0000 (RD0–RD3 en sorties)',
                  fail: '3. TRISD encore en entrée : en Banque 1, mets TRISD à 0 pour allumer les LEDs.',
                },
                {
                  ok: checkLoopOk,
                  pass: '4. Synchronisation PORTA → PORTD réussie ! Clique sur RA0–RA3 pour tester.',
                  fail: '4. En Banque 0, lis PORTA, masque les 4 bits utiles, puis écris le résultat sur PORTD.',
                },
              ].map((step) => (
                <li
                  key={step.pass}
                  className={`flex items-start gap-2 ${
                    step.ok
                      ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {step.ok ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                  )}
                  <span>{step.ok ? step.pass : step.fail}</span>
                </li>
              ))}
            </ul>

            {confirmCorrectionStep === 'confirm' && (
              <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3 space-y-2 text-xs">
                <p className="font-semibold text-amber-950 dark:text-amber-100">
                  As-tu d’abord essayé d’écrire ton code par toi-même à l’aide des indices ?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePresetId('tp1-correction');
                      setSource(TP1_CORRECTION_CODE);
                      handleAssemble(TP1_CORRECTION_CODE);
                      setConfirmCorrectionStep('idle');
                    }}
                    className="min-h-[36px] px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Oui, j’ai essayé — charger la correction</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCorrectionStep('idle')}
                    className="min-h-[36px] px-3 rounded-lg border border-amber-400 text-amber-900 dark:text-amber-200 font-medium"
                  >
                    Non, je continue à chercher
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
