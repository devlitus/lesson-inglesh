export interface GrammarConcept {
  id: string;
  lessonId: string;
  title: string;
  explanation: string;
  rule: string;
  examples: string[];
  commonMistakes: string[];
  tips: string[];
  createdAt?: Date;
}

export interface CreateGrammarInput {
  lessonId: string;
  title: string;
  explanation: string;
  rule: string;
  examples: string[];
  commonMistakes: string[];
  tips: string[];
}

export interface GrammarResponse {
  grammar: {
    title: string;
    explanation: string;
    rule: string;
    examples: string[];
    commonMistakes: string[];
    tips: string[];
  }[];
}