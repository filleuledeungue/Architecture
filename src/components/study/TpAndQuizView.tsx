import React, { useState } from 'react';
import {
  ClipboardCheck,
  Cpu,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  ShieldQuestion,
  Eye,
  EyeOff,
  ListChecks,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { HighlightedText } from '../lesson/HighlightedText';

interface TpExercise {
  id: string;
  code: string;
  title: string;
  pins: string;
  summary: string;
  checklist: string[];
  hints: [string, string, string];
  skeletonPresetId: string;
  correctionLabel: string;
  correctionNotes: string;
  correctionCode: string;
  correctionLabPresetId?: string;
}

const TP_EXERCISES: TpExercise[] = [
  {
    id: 'tp1',
    code: 'TP 1 · L2GE',
    title: 'Commande de 4 LEDs par 4 boutons-poussoirs (PIC16F887)',
    pins: 'Boutons : RA0–RA3 · LEDs : RD0–RD3',
    summary:
      'Allumer la LED numéro i sur PORTD dès que le bouton i sur PORTA est appuyé. Au Reset, PORTA est analogique : tu dois d’abord le passer en numérique, configurer le sens des ports, puis recopier l’état des boutons en boucle.',
    checklist: [
      'J’ai repéré dans quelle banque se trouvent ANSEL, TRISA, TRISD et PORTA/PORTD.',
      'J’ai déterminé la valeur binaire exacte de TRISA (RA0–RA3 en entrée) et TRISD (RD0–RD3 en sortie).',
      'J’ai prévu un masque logique pour ne garder que les 4 bits utiles de PORTA.',
      'J’ai pensé à refermer RP1 et RP0 pour revenir en Banque 0 avant la boucle infinie.',
    ],
    hints: [
      'Indice 1 (Banques) : Sur PIC16F887, ANSEL (188h) est en Banque 3 (RP1=1, RP0=1), TRISA/TRISD sont en Banque 1 (RP1=0, RP0=1), et PORTA/PORTD sont en Banque 0 (RP1=0, RP0=0).',
      'Indice 2 (Registres) : Mets ANSEL à 0 avec CLRF ANSEL. Configure TRISA = 0x0F (bits 0..3 à 1 = entrées) et TRISD = 0x00 (sorties).',
      'Indice 3 (Boucle) : En Banque 0, utilise MOVF PORTA, W puis ANDLW 0x0F pour isoler RA0–RA3, puis MOVWF PORTD et GOTO BOUCLE.',
    ],
    skeletonPresetId: 'tp1-squelette',
    correctionLabel: 'Solution complète commentée (MPASM)',
    correctionNotes:
      'Ordre obligatoire : Banque 3 (ANSEL = 0) → Banque 1 (TRISA = 0x0F, TRISD = 0x00) → Banque 0 (lecture PORTA, masque 0x0F, écriture PORTD).',
    correctionCode: `; Correction TP1 L2GE : 4 LEDs / 4 Boutons
        ORG 0x0000
        BSF STATUS, RP1      ; Banque 3 (RP1=1, RP0=1)
        BSF STATUS, RP0
        CLRF ANSEL           ; PORTA en mode numérique
        BCF STATUS, RP1      ; Banque 1 (RP1=0, RP0=1)
        BSF STATUS, RP0
        MOVLW B'00001111'    ; RA0..RA3 en entrées
        MOVWF TRISA
        CLRF TRISD           ; RD0..RD3 en sorties
        BCF STATUS, RP0      ; Retour en Banque 0
BOUCLE: MOVF PORTA, W        ; Lecture des boutons
        ANDLW 0x0F           ; Garde uniquement les 4 bits bas
        MOVWF PORTD          ; Allume les LEDs correspondantes
        GOTO BOUCLE`,
    correctionLabPresetId: 'tp1-correction',
  },
  {
    id: 'tp2',
    code: 'TP 2 · L2GE',
    title: 'Compteur Modulo 10 000 sur 4 afficheurs 7 segments',
    pins: 'Segments A–G en parallèle · Sélection par 4 transistors ULN2004',
    summary:
      'Afficher 1234 puis compter de 0000 à 9999 grâce au multiplexage temporel : on n’allume qu’un seul afficheur à la fois, mais très vite (~5 ms chacun), pour tromper l’œil par persistance rétinienne.',
    checklist: [
      'J’ai vérifié si mes afficheurs sont à cathode commune (1 allume) ou anode commune (0 allume).',
      'J’ai prévu une table de correspondance (RETLW) transformant un chiffre 0..9 en motif 7 segments.',
      'J’ai pensé à éteindre les sélections ULN2004 avant de changer les segments (éviter l’effet fantôme).',
      'J’ai prévu 4 variables en RAM (unités, dizaines, centaines, milliers) et la retenue à 10.',
    ],
    hints: [
      'Indice 1 (Architecture) : Les 7 segments A–G des 4 afficheurs partagent le même port (ex. PORTB). Les 4 broches de sélection (ex. RC0–RC3) pilotent les transistors ULN2004 l’un après l’autre.',
      'Indice 2 (Table 7 segments) : Écris un sous-programme CALL TABLE_7SEG utilisant ADDWF PCL, F suivi de 10 RETLW (0x3F pour 0, 0x06 pour 1, 0x5B pour 2, etc.).',
      'Indice 3 (Anti-fantôme & Compteur) : À chaque rafraîchissement : éteindre sélection → envoyer le code segment → activer 1 seul afficheur → temporiser 5 ms. Incrémente unités ; si =10, remettre à 0 et incrémenter dizaines, etc.',
    ],
    skeletonPresetId: 'bac-a-sable',
    correctionLabel: 'Algorithme & extrait clé de multiplexage',
    correctionNotes:
      'Le secret du TP2 sans bavure visuelle : toujours couper l’afficheur précédent avant d’écrire le nouveau chiffre sur le bus des segments.',
    correctionCode: `; Extrait clé TP2 : Multiplexage propre + table cathode commune
AFFICHER_4_DIGITS:
        CLRF PORTC           ; Coupe tous les ULN2004 (anti-fantôme)
        MOVF UNITES, W
        CALL TABLE_7SEG
        MOVWF PORTB          ; Place les segments du chiffre Unités
        BSF PORTC, 0         ; Active uniquement l'afficheur 1
        CALL TEMPO_5MS
        ; Répéter pour DIZAINES (RC1), CENTAINES (RC2), MILLIERS (RC3)
        RETURN

TABLE_7SEG:
        ADDWF PCL, F         ; Saut indexé selon W (0..9)
        RETLW 0x3F           ; '0'
        RETLW 0x06           ; '1'
        RETLW 0x5B           ; '2'
        RETLW 0x4F           ; '3'
        RETLW 0x66           ; '4'`,
  },
  {
    id: 'tp3',
    code: 'TP 3 · L2GE',
    title: 'Feux de circulation routière (Carrefour 4 voies)',
    pins: '12 sorties PORTA/PORTC · Entrée sélecteur Jour/Nuit : RD0',
    summary:
      'Gérer un carrefour : si RD0 = 0 (Mode Jour), exécuter le cycle complet Vert → Orange → Rouge en alternant Voie A et Voie B. Si RD0 = 1 (Mode Nuit), faire clignoter uniquement les feux Orange.',
    checklist: [
      'J’ai passé ANSEL et ANSELH à 0x00 en Banque 3 (important car PORTA et PORTC/ANALOG ont des broches analogiques).',
      'J’ai mis les broches des feux en sortie (TRISA=0, TRISC=0) et RD0 en entrée (TRISD = 0x01).',
      'J’ai repéré comment tester un seul bit d’entrée (RD0) avec BTFSC ou BTFSS.',
      'J’ai vérifié les états sûrs : jamais Vert A et Vert B allumés en même temps !',
    ],
    hints: [
      'Indice 1 (Piège du manuel) : Attention, le polycopié de TP liste deux fois RC6 par erreur : les 6 bits de PORTC sont bien RC0..RC5 (ou RC1..RC6). Vérifie ton câblage sur Proteus.',
      'Indice 2 (Test Jour/Nuit) : Utilise BTFSC PORTD, 0 suivi de GOTO MODE_JOUR puis GOTO MODE_NUIT. Si RD0 = 0, BTFSC saute l’instruction suivante !',
      'Indice 3 (Séquence Jour) : Phase 1 : Vert A + Rouge B (tempo longue) → Phase 2 : Orange A + Rouge B (tempo courte) → Phase 3 : Rouge A + Vert B → Phase 4 : Rouge A + Orange B.',
    ],
    skeletonPresetId: 'tp3-squelette',
    correctionLabel: 'Correction structurée Mode Jour / Mode Nuit',
    correctionNotes:
      'En testant BTFSC PORTD, 0 au début de chaque boucle, le basculement entre Mode Jour et Mode Nuit est immédiat.',
    correctionCode: `; Correction TP3 L2GE : Carrefour Jour / Nuit
        ORG 0x0000
        BSF STATUS, RP1
        BSF STATUS, RP0
        CLRF ANSEL
        CLRF ANSELH          ; Toutes broches en numérique
        BCF STATUS, RP1      ; Banque 1
        CLRF TRISA           ; Feux Voie A
        CLRF TRISC           ; Feux Voie B
        MOVLW 0x01           ; RD0 en entrée (Mode Jour/Nuit)
        MOVWF TRISD
        BCF STATUS, RP0      ; Banque 0

MAIN:   BTFSC PORTD, 0       ; RD0 = 0 ?
        GOTO MODE_NUIT       ; Si RD0 = 1 -> Nuit clignotant
MODE_JOUR:
        MOVLW B'00100100'    ; Ex: Vert A + Rouge B
        MOVWF PORTA
        CALL TEMPO_5S
        MOVLW B'00100010'    ; Orange A + Rouge B
        MOVWF PORTA
        CALL TEMPO_2S
        GOTO MAIN
MODE_NUIT:
        MOVLW B'00010010'    ; Les deux Orange ON
        MOVWF PORTA
        CALL TEMPO_500MS
        CLRF PORTA           ; Tous OFF
        CALL TEMPO_500MS
        GOTO MAIN`,
  },
  {
    id: 'tp4',
    code: 'TP 4 · L2GE',
    title: 'Afficheur LCD LM016L en mode 4 bits',
    pins: 'D4–D7 + RS (0 = Commande, 1 = Caractère ASCII) + E (impulsion)',
    summary:
      'Piloter un écran LCD alphanumérique avec seulement 6 fils (D4–D7, RS, E). Chaque octet (commande ou lettre ASCII) doit être coupé en deux : quartet haut d’abord, puis quartet bas, chacun validé par un front descendant sur E.',
    checklist: [
      'J’ai distingué RS = 0 (envoyer une commande comme effacer l’écran) et RS = 1 (afficher une lettre).',
      'J’ai compris comment isoler le quartet haut (masque 0xF0) puis le quartet bas (SWAPF + masque).',
      'J’ai prévu une impulsion sur la broche E (BSF E → petite attente → BCF E) pour valider chaque demi-octet.',
      'J’ai noté la séquence exacte d’initialisation en mode 4 bits : 0x28, 0x0C, 0x06, 0x01.',
    ],
    hints: [
      'Indice 1 (Coquille du manuel TP4) : La commande 0x06 configure I/D = 1, ce qui déplace le curseur vers la DROITE après chaque lettre (et non vers la gauche).',
      'Indice 2 (Découpage 4 bits) : Pour envoyer un octet placé dans DATA_TEMP sur RD4..RD7 : envoie d’abord (DATA_TEMP & 0xF0), pulse E, puis SWAPF DATA_TEMP, W (qui échange les 2 quartets), masque 0xF0, envoie et re-pulse E.',
      'Indice 3 (Initialisation) : Attends 15 ms au démarrage, envoie 0x03 trois fois (en quartet haut), puis 0x02 (passage 4 bits), puis 0x28 (2 lignes, 5x7), 0x0C (Display ON, curseur OFF), 0x06 (curseur à droite), 0x01 (Clear + attente 2 ms).',
    ],
    skeletonPresetId: 'bac-a-sable',
    correctionLabel: 'Sous-programme d’envoi 4 bits commenté',
    correctionNotes:
      'Grâce à SWAPF, on réutilise exactement le même routage matériel sur D4–D7 pour les deux quartets de chaque octet.',
    correctionCode: `; Sous-programme clé TP4 : Envoyer W en 2 quartets sur RD4..RD7
; Entrée : W = octet à envoyer, RS déjà positionné (0=Cmd, 1=Data)
LCD_SEND_BYTE:
        MOVWF LCD_TMP        ; Sauve l'octet complet
        ANDLW 0xF0           ; Quartet haut -> bits 7..4
        IORWF LCD_RS_MASK, W ; Garde l'état de RS
        MOVWF PORTD
        CALL PULSE_E         ; Valide le quartet haut

        SWAPF LCD_TMP, W     ; Échange quartet bas <-> haut !
        ANDLW 0xF0
        IORWF LCD_RS_MASK, W
        MOVWF PORTD
        CALL PULSE_E         ; Valide le quartet bas
        CALL TEMPO_100US
        RETURN`,
  },
  {
    id: 'tp5',
    code: 'TP 5 · L2GE',
    title: 'Thermomètre électronique TMP36 + ADC + LCD',
    pins: 'Capteur TMP36 sur RA0/AN0 · Formule : T(°C) = (mV - 500) / 10',
    summary:
      'Lire une tension analogique issue du capteur TMP36 sur AN0 avec le convertisseur 10 bits du PIC16F887, attendre la fin de conversion (GO/DONE = 0), convertir le résultat brut en degrés Celsius et l’afficher sur LCD.',
    checklist: [
      'Contrairement aux TP1–TP4, j’ai gardé RA0/AN0 en mode analogique (ANSEL bit 0 = 1) et RA0 en entrée (TRISA bit 0 = 1).',
      'J’ai choisi la justification à droite (ADFM = 1 dans ADCON1) et l’horloge ADC (ADCS dans ADCON0).',
      'J’ai respecté le temps d’acquisition (~12 µs) AVANT de lancer GO/DONE = 1, puis attendu que GO/DONE retombe à 0.',
      'J’ai appliqué la formule du capteur TMP36 : à 25 °C, Vout = 750 mV → (750 - 500)/10 = 25 °C.',
    ],
    hints: [
      'Indice 1 (Banques ADC) : ANSEL (bit 0 = 1) est en Banque 3 ; ADCON1 (ADFM=1, Vref=VDD/VSS) est en Banque 1 ; ADCON0 (ADON=1, canal CHS=0000), ADRESH sont en Banque 0 ; ADRESL est en Banque 1 !',
      'Indice 2 (Lancer & Attendre) : Mets ADCON0 = B\'01000001\' (Fosc/8, AN0, ADC actif). Attends 20 µs, lance BSF ADCON0, 1 (GO/DONE), puis boucle sur BTFSC ADCON0, 1 / GOTO $-1.',
      'Indice 3 (Calcul température) : Sous Vref = 5 V (5000 mV / 1024 ≈ 4,88 mV par pas) ou Vref = 3,3 V (3300 / 1024 ≈ 3,22 mV), convertis le mot 10 bits (ADRESH:ADRESL) en mV, soustrais 500 mV, puis divise par 10.',
    ],
    skeletonPresetId: 'bac-a-sable',
    correctionLabel: 'Séquence complète d’acquisition ADC 10 bits',
    correctionNotes:
      'Piège classique d’examen : ADRESH est en Banque 0 mais ADRESL (8 bits bas) est en Banque 1 ! Il faut changer de banque pour lire les deux.',
    correctionCode: `; Correction acquisition ADC TP5 (Canal AN0 -> ADRESH:ADRESL)
        BSF STATUS, RP1      ; Banque 3
        BSF STATUS, RP0
        MOVLW 0x01           ; RA0/AN0 analogique uniquement
        MOVWF ANSEL
        BCF STATUS, RP1      ; Banque 1
        MOVLW 0x01           ; RA0 en entrée
        MOVWF TRISA
        MOVLW B'10000000'    ; ADFM=1 (justification à droite), Vref=VDD/VSS
        MOVWF ADCON1
        BCF STATUS, RP0      ; Banque 0
        MOVLW B'01000001'    ; Fosc/8, Canal AN0, ADON=1
        MOVWF ADCON0
        CALL TEMPO_20US      ; Temps de charge du condensateur interne
        BSF ADCON0, 1        ; Démarre conversion (GO/DONE = 1)
WAIT_ADC:
        BTFSC ADCON0, 1      ; Conversion terminée quand bit 1 = 0
        GOTO WAIT_ADC
        MOVF ADRESH, W       ; Lit les 2 bits de poids fort (Banque 0)
        BSF STATUS, RP0      ; Passe en Banque 1 pour lire ADRESL !
        MOVF ADRESL, W       ; Lit les 8 bits de poids faible`,
  },
];

interface QuizQuestion {
  id: string;
  moduleTag: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    moduleTag: 'Module 1 · Architecture',
    question: 'Quelle est la cause principale du goulot d’étranglement de Von Neumann ?',
    options: [
      'La séparation entre mémoire programme et mémoire de données',
      'Le partage d’un bus unique entre les instructions et les données',
      'L’absence de registre d’état dans l’UAL',
    ],
    correctIdx: 1,
    explanation:
      'En Von Neumann, instructions et données circulent sur le même bus unique, empêchant de lire une instruction et une donnée simultanément.',
  },
  {
    id: 'q2',
    moduleTag: 'Module 2 · Lecture / Écriture Mémoire',
    question: 'Lors d’une écriture mémoire par le processeur, quel est l’état typique du signal R/W et que se passe-t-il si l’adresse vise une ROM ?',
    options: [
      'R/W = 0 (Write) ; une ROM ignore l’écriture car /WE n’est pas câblé sur sa matrice',
      'R/W = 1 (Read) ; la ROM efface son contenu précédent avant d’écrire',
      'R/W = 0 ; le bus d’adresses devient bidirectionnel pour renvoyer un accusé',
    ],
    correctIdx: 0,
    explanation:
      'Pour écrire, le processeur met R/W = 0 et place la donnée sur le Bus de données. Une ROM étant en lecture seule, elle bloque toute écriture.',
  },
  {
    id: 'q3',
    moduleTag: 'Module 3 · Performances',
    question: 'Un CPU cadencé à 24 MHz a un CPI moyen de 3. Quelle est sa vitesse en MIPS ?',
    options: ['8 MIPS', '72 MIPS', '21 MIPS'],
    correctIdx: 0,
    explanation: 'MIPS = Fréquence (MHz) / CPI = 24 / 3 = 8 MIPS.',
  },
  {
    id: 'q4',
    moduleTag: 'Module 4 · Interruptions',
    question: 'Dans le cycle d’une interruption (ex. niveau 3 survenant pendant le niveau 2), que fait impérativement la routine ISR avant de rendre la main via RETFIE/RTI ?',
    options: [
      'Désactiver définitivement GIE pour empêcher toute future interruption',
      'Effacer le drapeau matériel d’interruption (Flag = 0) sinon l’interruption redémarre en boucle infinie',
      'Mettre le registre PC à $0000 manuellement',
    ],
    correctIdx: 1,
    explanation:
      'Le drapeau matériel (ex. INTF, T0IF) reste à 1 tant que le programme ne l’efface pas par logiciel. S’il reste à 1 lors de RETFIE/RTI, le CPU replonge immédiatement dans l’ISR !',
  },
  {
    id: 'q5',
    moduleTag: 'Module 5 · CISC 68HC11',
    question: 'Sur le 68HC11, pourquoi écrit-on « LDAA #$10 » au lieu de « LDAA $10 » ?',
    options: [
      'Le symbole # indique l’adressage immédiat (charger la valeur 0x10) ; sans #, c’est l’adressage direct (lire le contenu de la case mémoire $0010)',
      'Le symbole # convertit le nombre hexadécimal en binaire automatiquement',
      'Les deux écritures sont strictement identiques sur le 68HC11',
    ],
    correctIdx: 0,
    explanation:
      'C’est la règle d’or du 68HC11 : # = valeur immédiate dans A ; sans # = adresse mémoire dont on va lire le contenu.',
  },
  {
    id: 'q6',
    moduleTag: 'Module 5 · CISC 68HC11',
    question: 'Sur le Motorola 68HC11, de quoi est composé le registre 16 bits D ?',
    options: [
      'Des deux registres d’index IX et IY',
      'De la juxtaposition A (poids fort) : B (poids faible)',
      'De la somme arithmétique A + B',
    ],
    correctIdx: 1,
    explanation: 'D est formé par la concaténation de l’accumulateur A (bits 15..8) et B (bits 7..0).',
  },
  {
    id: 'q7',
    moduleTag: 'Module 6 · RISC PIC16F887',
    question: 'Que signifie le deuxième opérande dans « INCF COMPTEUR, W » sur PIC16F887 ?',
    options: [
      'Que le registre W doit être incrémenté en même temps que COMPTEUR',
      'Que COMPTEUR + 1 est rangé dans W (d = 0), laissant la case RAM COMPTEUR intacte',
      'Que l’instruction dure 2 cycles Tcy au lieu d’un seul',
    ],
    correctIdx: 1,
    explanation:
      'Sur PIC16F887, d=0 (, W) range le résultat dans l’accumulateur W sans modifier la case F ; d=1 (, F) modifie directement la case mémoire F.',
  },
  {
    id: 'q8',
    moduleTag: 'Module 6 · PIC16F887',
    question: 'Dans quelle banque du PIC16F887 se trouvent les registres ANSEL et ANSELH ?',
    options: ['Banque 0 (RP1=0, RP0=0)', 'Banque 1 (RP1=0, RP0=1)', 'Banque 3 (RP1=1, RP0=1)'],
    correctIdx: 2,
    explanation: 'ANSEL (188h) et ANSELH (189h) sont situés en Banque 3.',
  },
];

/**
 * Vue combinée TP L2GE (guidage socratique sans spoiler + correction à la demande) + Quiz
 */
export const TpAndQuizView: React.FC = () => {
  const { setView, saveQuizScore, state } = useAppStore();
  // Nombre d'indices débloqués par TP (0 à 3)
  const [unlockedHints, setUnlockedHints] = useState<Record<string, number>>({});
  // Cases cochées par l'étudiant dans chaque checklist TP
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  // Workflow de correction en 2 étapes : 'idle' | 'confirming' | 'revealed'
  const [correctionState, setCorrectionState] = useState<
    Record<string, 'idle' | 'confirming' | 'revealed'>
  >({});

  const [answers, setAnswers] = useState<Record<string, number>>({});

  const answeredCount = Object.keys(answers).length;
  const correctCount = QUIZ_QUESTIONS.filter((q) => answers[q.id] === q.correctIdx).length;
  const scorePct = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);

  const handleAnswer = (qId: string, idx: number) => {
    const next = { ...answers, [qId]: idx };
    setAnswers(next);
    const nextCorrect = QUIZ_QUESTIONS.filter((q) => next[q.id] === q.correctIdx).length;
    saveQuizScore('global-quiz', Math.round((nextCorrect / QUIZ_QUESTIONS.length) * 100));
  };

  const toggleChecklist = (tpId: string, stepIdx: number) => {
    const key = `${tpId}-${stepIdx}`;
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const revealNextHint = (tpId: string) => {
    setUnlockedHints((prev) => {
      const curr = prev[tpId] ?? 0;
      return { ...prev, [tpId]: Math.min(3, curr + 1) };
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
      {/* Section TP L2GE */}
      <section className="space-y-5">
        <header className="space-y-1.5 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Travaux Pratiques ESP · Systèmes Embarqués L2GE</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
            Assistant guidé de TP (sans correction immédiate)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Suis la méthode en 3 temps pour chaque TP : coche ta réflexion, débloque les indices progressifs au besoin, code le squelette dans le Labo PIC16F887 — et ne demande la correction que si tu as d’abord cherché par toi-même.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5">
          {TP_EXERCISES.map((tp) => {
            const hintLevel = unlockedHints[tp.id] ?? 0;
            const corrMode = correctionState[tp.id] ?? 'idle';
            const doneCount = tp.checklist.filter((_, i) => checkedSteps[`${tp.id}-${i}`]).length;

            return (
              <div
                key={tp.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                    {tp.code}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    <HighlightedText text={tp.pins} />
                  </span>
                </div>

                <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                  {tp.title}
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <HighlightedText text={tp.summary} />
                </p>

                {/* Checklist de réflexion personnelle */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span className="inline-flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span>Étape 1 · Prépare ta réflexion avant de coder</span>
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {doneCount}/{tp.checklist.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {tp.checklist.map((item, idx) => {
                      const checked = Boolean(checkedSteps[`${tp.id}-${idx}`]);
                      return (
                        <label
                          key={item}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 cursor-pointer select-none py-0.5"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleChecklist(tp.id, idx)}
                            className="mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <span className={checked ? 'line-through opacity-70' : ''}>
                            <HighlightedText text={item} />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Boutons d'action guidée */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setView({ type: 'lab-pic16f887', presetId: tp.skeletonPresetId })
                    }
                    className="min-h-[42px] px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Ouvrir le squelette dans le Labo PIC16F887</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {hintLevel < 3 ? (
                    <button
                      type="button"
                      onClick={() => revealNextHint(tp.id)}
                      className="min-h-[42px] px-3.5 rounded-xl border border-amber-300 dark:border-amber-700/70 bg-amber-50/70 dark:bg-amber-950/30 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 inline-flex items-center gap-1.5"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Débloquer l’indice {hintLevel + 1}/3</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUnlockedHints((prev) => ({ ...prev, [tp.id]: 0 }))}
                      className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      Replier les indices
                    </button>
                  )}

                  {corrMode === 'idle' && (
                    <button
                      type="button"
                      onClick={() =>
                        setCorrectionState((prev) => ({ ...prev, [tp.id]: 'confirming' }))
                      }
                      className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-400 inline-flex items-center gap-1.5 ml-auto"
                    >
                      <ShieldQuestion className="w-3.5 h-3.5" />
                      <span>Demander la correction</span>
                    </button>
                  )}

                  {corrMode === 'revealed' && (
                    <button
                      type="button"
                      onClick={() => setCorrectionState((prev) => ({ ...prev, [tp.id]: 'idle' }))}
                      className="min-h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5 ml-auto"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Masquer la correction</span>
                    </button>
                  )}
                </div>

                {/* Indices progressifs débloqués */}
                {hintLevel > 0 && (
                  <div className="space-y-2">
                    {tp.hints.slice(0, hintLevel).map((hintText, idx) => (
                      <div
                        key={hintText}
                        className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3.5 text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-relaxed"
                      >
                        <HighlightedText text={hintText} />
                        {idx === hintLevel - 1 && hintLevel < 3 && (
                          <span className="block mt-1 text-[11px] opacity-75">
                            Essaie déjà avec cet indice avant de débloquer le suivant !
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Confirmation pédagogique avant affichage de la correction */}
                {corrMode === 'confirming' && (
                  <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40 p-4 space-y-2.5">
                    <p className="text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-100">
                      Avant d’afficher la correction : as-tu d’abord essayé d’écrire ton propre programme ou schéma avec les indices ci-dessus ?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCorrectionState((prev) => ({ ...prev, [tp.id]: 'revealed' }))
                        }
                        className="min-h-[38px] px-3.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Oui, j’ai essayé — voir la correction</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCorrectionState((prev) => ({ ...prev, [tp.id]: 'idle' }))
                        }
                        className="min-h-[38px] px-3.5 rounded-lg border border-amber-400 text-xs font-medium text-amber-950 dark:text-amber-200"
                      >
                        Non, je continue d’essayer seul(e)
                      </button>
                    </div>
                  </div>
                )}

                {/* Correction commentée (visible uniquement après confirmation explicite) */}
                {corrMode === 'revealed' && (
                  <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {tp.correctionLabel}
                      </span>
                      {tp.correctionLabPresetId && (
                        <button
                          type="button"
                          onClick={() =>
                            setView({ type: 'lab-pic16f887', presetId: tp.correctionLabPresetId })
                          }
                          className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Charger cette correction dans le Labo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      <HighlightedText text={tp.correctionNotes} />
                    </p>
                    <pre className="rounded-xl bg-slate-950 text-emerald-100 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
                      {tp.correctionCode}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section Quiz d'entraînement */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              Quiz d’entraînement (Modules 1 à 6)
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              Score : {correctCount}/{QUIZ_QUESTIONS.length} ({scorePct}%)
              {state.quizScores['global-quiz'] !== undefined &&
                ` · Meilleur : ${state.quizScores['global-quiz']}%`}
            </span>
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={() => setAnswers({})}
                className="min-h-[38px] px-3 rounded-lg border border-slate-300 dark:border-slate-700 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recommencer</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {QUIZ_QUESTIONS.map((q, qIdx) => {
            const chosen = answers[q.id];
            const isAnswered = chosen !== undefined;
            return (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm"
              >
                <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                  Question {qIdx + 1} · {q.moduleTag}
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                  <HighlightedText text={q.question} />
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, idx) => {
                    const selected = chosen === idx;
                    const isRight = idx === q.correctIdx;
                    let cls =
                      'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-sky-400';
                    if (isAnswered) {
                      if (isRight) {
                        cls =
                          'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100';
                      } else if (selected) {
                        cls =
                          'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAnswer(q.id, idx)}
                        className={`w-full min-h-[46px] px-4 py-2.5 rounded-xl border text-left text-sm transition-colors flex items-center justify-between gap-2 ${cls}`}
                      >
                        <span>
                          <HighlightedText text={opt} />
                        </span>
                        {isAnswered && isRight && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <HighlightedText text={q.explanation} />
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
