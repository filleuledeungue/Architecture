import React from 'react';

/**
 * Mise en couleur sémantique automatique des mots-clés importants du cours :
 * - Bleu : Adresses, bus d'adresses, pointeurs (PC, IX, IY, SP, FSR, $XXXX, 0xXX)
 * - Rouge/Rose : Données, bus de données, accumulateurs, mémoires, ports (A, B, D, W, RAM, ROM, PORTx)
 * - Orange/Ambre : Commande, drapeaux, contrôle, interruptions (CCR, STATUS, TRISx, ANSEL, GIE, R/W, /CS, DMA, IRQ)
 * - Émeraude : Architectures & instructions clés (Von Neumann, Harvard, CISC, RISC, UAL, mnémoniques)
 */

const ADDRESS_TERMS = [
  "Bus d[’']adresses",
  "bus d[’']adresses",
  "espace adressable",
  "Espace adressable",
  "décodage d[’']adresse",
  "Décodage d[’']adresse",
  "décodeur d[’']adresse",
  "cartographie mémoire",
  "Cartographie mémoire",
  "Compteur Ordinal",
  "Program Counter",
  "\\$[0-9A-Fa-f]{2,4}",
  "0x[0-9A-Fa-f]+",
  "\\b[0-9][0-9A-Fa-f]{1,3}h\\b",
  "\\bPC\\b",
  "\\bIX\\b",
  "\\bIY\\b",
  "\\bSP\\b",
  "\\bFSR\\b",
  "\\bINDF\\b",
  "\\bIRP\\b",
];

const DATA_TERMS = [
  "Bus de données",
  "bus de données",
  "Bus Programme",
  "bus Programme",
  "Bus Données",
  "bus Données",
  "Mémoire Principale",
  "mémoire principale",
  "Mémoire Programme",
  "mémoire programme",
  "Mémoire de Données",
  "mémoire de données",
  "mémoire cache",
  "Mémoire Cache",
  "Mémoire cache",
  "Cache Hit",
  "Cache Miss",
  "\\bSRAM\\b",
  "\\bEEPROM\\b",
  "\\bEPROM\\b",
  "\\bPROM\\b",
  "\\bFlash\\b",
  "\\bRAM\\b",
  "\\bROM\\b",
  "\\bPORT[A-E]\\b",
  "\\bPORTCL\\b",
  "\\bRCREG\\b",
  "\\bTXREG\\b",
  "\\bSCDR\\b",
  "\\bADRESH\\b",
  "\\bADRESL\\b",
  "\\bADR[1-4]\\b",
  "\\bEEDATA\\b",
  "\\bEEADR\\b",
];

const CONTROL_TERMS = [
  "Bus de commande",
  "bus de commande",
  "Unité de Commande",
  "unité de commande",
  "Unité de Traitement",
  "unité de traitement",
  "Registre d[’']état",
  "registre d[’']état",
  "Registre d[’']Instruction",
  "registre d[’']instruction",
  "Chip Select",
  "vol de cycle",
  "Vol de cycle",
  "Interruptions?",
  "interruptions?",
  "Scrutation",
  "scrutation",
  "Polling",
  "Temps d[’']accès",
  "temps d[’']accès",
  "Temps de cycle",
  "temps de cycle",
  "haute impédance",
  "conflit de bus",
  "R/W",
  "/CS",
  "/OE",
  "/WE",
  "\\bCCR\\b",
  "\\bSTATUS\\b",
  "\\bTRIS[A-E]\\b",
  "\\bDDR[A-D]\\b",
  "\\bPACTL\\b",
  "\\bANSELH?\\b",
  "\\bINTCON\\b",
  "\\bOPTION_REG\\b",
  "\\bADCTL\\b",
  "\\bADCON[01]\\b",
  "\\bSCCR[12]\\b",
  "\\bSCSR\\b",
  "\\bBAUD\\b",
  "\\bTXSTA\\b",
  "\\bRCSTA\\b",
  "\\bPIR[12]\\b",
  "\\bPIE[12]\\b",
  "\\bGIE\\b",
  "\\bPEIE\\b",
  "\\bINTF\\b",
  "\\bT0IF\\b",
  "\\bRP0\\b",
  "\\bRP1\\b",
  "\\bMODA\\b",
  "\\bMODB\\b",
  "\\bDMA\\b",
  "\\bIRQ\\b",
  "\\bXIRQ\\b",
  "\\bRESET\\b",
];

const ARCH_AND_OP_TERMS = [
  "Von Neumann",
  "Harvard",
  "goulot d[’']étranglement",
  "Goulot d[’']étranglement",
  "Microcontrôleur",
  "microcontrôleur",
  "Microprocesseur",
  "microprocesseur",
  "Unité Centrale",
  "\\bCISC\\b",
  "\\bRISC\\b",
  "\\b68HC11\\b",
  "\\bPIC16F887\\b",
  "\\bPIC\\b",
  "\\bDSP\\b",
  "\\bUAL\\b",
  "\\bALU\\b",
  "\\bMIPS\\b",
  "\\bCPI\\b",
  "\\bLecture\\b",
  "\\bÉcriture\\b",
  "\\bpipeline\\b",
  "\\bUSART\\b",
  "\\bSCI\\b",
  "\\bSPI\\b",
  "\\bI2C\\b",
  "\\bCAN\\b",
  "\\bADC\\b",
  // Mnémoniques 68HC11 & PIC16F887 + directives
  "\\bLDAA\\b",
  "\\bLDAB\\b",
  "\\bLDD\\b",
  "\\bLDX\\b",
  "\\bLDY\\b",
  "\\bSTAA\\b",
  "\\bSTAB\\b",
  "\\bSTD\\b",
  "\\bSTX\\b",
  "\\bSTY\\b",
  "\\bTAB\\b",
  "\\bTBA\\b",
  "\\bXGDX\\b",
  "\\bADDA\\b",
  "\\bADDB\\b",
  "\\bADCA\\b",
  "\\bADDD\\b",
  "\\bSUBA\\b",
  "\\bSUBD\\b",
  "\\bCMPA\\b",
  "\\bINCA\\b",
  "\\bDECA\\b",
  "\\bANDA\\b",
  "\\bORAA\\b",
  "\\bEORA\\b",
  "\\bCOMA\\b",
  "\\bMUL\\b",
  "\\bIDIV\\b",
  "\\bBSET\\b",
  "\\bBCLR\\b",
  "\\bBRSET\\b",
  "\\bBRCLR\\b",
  "\\bASLA\\b",
  "\\bLSLA\\b",
  "\\bLSRA\\b",
  "\\bASRA\\b",
  "\\bROLA\\b",
  "\\bRORA\\b",
  "\\bBRA\\b",
  "\\bBEQ\\b",
  "\\bBNE\\b",
  "\\bBCC\\b",
  "\\bBCS\\b",
  "\\bBGE\\b",
  "\\bBLT\\b",
  "\\bBHI\\b",
  "\\bBLO\\b",
  "\\bPSHA\\b",
  "\\bPULA\\b",
  "\\bPHA\\b",
  "\\bPLA\\b",
  "\\bJSR\\b",
  "\\bBSR\\b",
  "\\bRTS\\b",
  "\\bSWI\\b",
  "\\bRTI\\b",
  "\\bCLI\\b",
  "\\bSEI\\b",
  "\\bCLC\\b",
  "\\bSEC\\b",
  "\\bMOVLW\\b",
  "\\bMOVWF\\b",
  "\\bMOVF\\b",
  "\\bCLRF\\b",
  "\\bCLRW\\b",
  "\\bADDLW\\b",
  "\\bSUBLW\\b",
  "\\bANDLW\\b",
  "\\bIORLW\\b",
  "\\bXORLW\\b",
  "\\bADDWF\\b",
  "\\bSUBWF\\b",
  "\\bANDWF\\b",
  "\\bIORWF\\b",
  "\\bINCF\\b",
  "\\bDECF\\b",
  "\\bDECFSZ\\b",
  "\\bINCFSZ\\b",
  "\\bBSF\\b",
  "\\bBCF\\b",
  "\\bBTFSC\\b",
  "\\bBTFSS\\b",
  "\\bRLF\\b",
  "\\bRRF\\b",
  "\\bSWAPF\\b",
  "\\bGOTO\\b",
  "\\bCALL\\b",
  "\\bRETURN\\b",
  "\\bRETLW\\b",
  "\\bRETFIE\\b",
  "\\bCLRWDT\\b",
  "\\bSLEEP\\b",
  "\\bORG\\b",
  "\\bEQU\\b",
  "\\bFCB\\b",
  "\\bFDB\\b",
  "\\bFCC\\b",
  "\\bRMB\\b",
];

const MASTER_PATTERN = new RegExp(
  `(${[
    ...ADDRESS_TERMS,
    ...DATA_TERMS,
    ...CONTROL_TERMS,
    ...ARCH_AND_OP_TERMS,
  ].join('|')})`,
  'g',
);

const ADDRESS_RE = new RegExp(`^(?:${ADDRESS_TERMS.join('|')})$`);
const DATA_RE = new RegExp(`^(?:${DATA_TERMS.join('|')})$`);
const CONTROL_RE = new RegExp(`^(?:${CONTROL_TERMS.join('|')})$`);

interface HighlightedTextProps {
  text: string;
  className?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, className }) => {
  const parts = text.split(MASTER_PATTERN);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (!part) return null;
        if (idx % 2 === 1) {
          if (ADDRESS_RE.test(part)) {
            return (
              <span
                key={idx}
                className="font-semibold text-blue-700 dark:text-blue-400"
              >
                {part}
              </span>
            );
          }
          if (DATA_RE.test(part)) {
            return (
              <span
                key={idx}
                className="font-semibold text-rose-700 dark:text-rose-400"
              >
                {part}
              </span>
            );
          }
          if (CONTROL_RE.test(part)) {
            return (
              <span
                key={idx}
                className="font-semibold text-amber-700 dark:text-amber-400"
              >
                {part}
              </span>
            );
          }
          return (
            <span
              key={idx}
              className="font-semibold text-emerald-700 dark:text-emerald-400"
            >
              {part}
            </span>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
};
