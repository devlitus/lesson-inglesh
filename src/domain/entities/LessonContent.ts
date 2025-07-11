import type { Lesson } from './Lesson';
import type { VocabularyItem } from './Vocabulary';
import type { GrammarConcept } from './Grammar';
import type { Exercise } from './Exercise';

export interface LessonContent {
  lesson: Lesson;
  vocabulary: VocabularyItem[];
  grammar: GrammarConcept[];
  exercises: Exercise[];
}

export interface LessonContentSummary {
  lessonId: string;
  vocabularyCount: number;
  grammarCount: number;
  exerciseCount: number;
  totalDuration: number;
  status: 'generating' | 'ready' | 'completed';
}