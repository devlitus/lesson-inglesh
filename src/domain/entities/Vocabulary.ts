export interface VocabularyItem {
  id: string;
  lessonId: string;
  word: string;
  pronunciation: string;
  translation: string;
  definition: string;
  example: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'other';
  createdAt?: Date;
}

export interface CreateVocabularyInput {
  lessonId: string;
  word: string;
  pronunciation: string;
  translation: string;
  definition: string;
  example: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'other';
}

export interface VocabularyResponse {
  vocabulary: {
    word: string;
    pronunciation: string;
    translation: string;
    definition: string;
    example: string;
    partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'other';
    difficulty: 1 | 2 | 3 | 4 | 5;
  }[];
}