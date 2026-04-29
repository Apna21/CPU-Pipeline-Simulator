export interface QuizScenario {
  id: string;
  title: string;
  program: string;
  description?: string;
  initialRegisters?: Record<number, number>;
  initialMemory?: Record<number, number>;
}

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
  hint?: string;
  scenario?: QuizScenario;
}

export interface QuizModule {
  id: string;
  title: string;
  description: string;
  tutorialSection: string;
  questions: QuizQuestion[];
}
