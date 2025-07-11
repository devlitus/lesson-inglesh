export interface Exercise {
  id: string;
  lessonId: string;
  type: 'fill-blank' | 'multiple-choice' | 'translation' | 'matching' | 'ordering';
  question: string;
  options?: string[]; // para multiple choice
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  createdAt?: Date;
}

export interface CreateExerciseInput {
  lessonId: string;
  type: 'fill-blank' | 'multiple-choice' | 'translation' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface ExerciseResponse {
  exercises: {
    type: 'fill-blank' | 'multiple-choice' | 'translation' | 'matching' | 'ordering';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
  }[];
}