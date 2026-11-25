/**
 * Types principaux du contenu pédagogique (modules, leçons à 3 niveaux, glossaire, quiz)
 */

export type ExplanationLevel = 'kid' | 'simple' | 'technical';

export type ModuleStatus = 'available' | 'planned';

export type SimulationId =
  | 'von-neumann-harvard'
  | 'address-decoding'
  | 'bus-capacity-playground'
  | 'mips-cpi-playground'
  | 'memory-rw-cycle'
  | 'interrupt-flow'
  | 'link-lab-68hc11'
  | 'link-lab-pic16f887';

export interface LessonCheckpoint {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  hint: string;
}

export interface ThreeLevelExplanation {
  kid: {
    title: string;
    analogyTag: string;
    body: string;
  };
  simple: {
    title: string;
    body: string;
  };
  technical: {
    title: string;
    body: string;
    specs?: string[];
  };
  alternativeAnalogy: {
    title: string;
    body: string;
  };
}

export interface InstructionRow {
  mnemonic: string;
  family: string;
  action: string;
  flags?: string;
  example: string;
  usageNote: string;
}

export interface DeepDiveSection {
  title: string;
  subtitle: string;
  accent?: 'blue' | 'emerald' | 'amber' | 'rose';
  paragraphs?: string[];
  instructions?: InstructionRow[];
}

export interface LessonData {
  id: string;
  moduleId: string;
  number: string;
  title: string;
  subtitle: string;
  durationMin: number;
  pdfReference: string;
  whyItExists: string;
  levels: ThreeLevelExplanation;
  howItWorks: {
    summary: string;
    steps: {
      label: string;
      detail: string;
      highlightBus?: 'address' | 'data' | 'control';
    }[];
    courseNoteWarning?: {
      title: string;
      detail: string;
    };
  };
  deepDiveSections?: DeepDiveSection[];
  simulationId?: SimulationId;
  playgroundTitle?: string;
  checkpoint: LessonCheckpoint;
  keyTakeaways: string[];
  glossaryKeys: string[];
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  status: ModuleStatus;
  plannedPhase?: string;
  pdfSources: string[];
  lessons: LessonData[];
}

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases?: string[];
  moduleRef: string;
  kidAnalogy: string;
  simpleDef: string;
  technicalDef: string;
  busColor?: 'address' | 'data' | 'control';
}
