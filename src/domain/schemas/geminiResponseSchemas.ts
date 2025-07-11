import { z } from 'zod';

// Schema para validar respuestas de vocabulario de Gemini
export const VocabularyItemSchema = z.object({
  word: z.string().min(1, 'La palabra es requerida'),
  pronunciation: z.string().min(1, 'La pronunciación es requerida'),
  translation: z.string().min(1, 'La traducción es requerida'),
  definition: z.string().min(1, 'La definición es requerida'),
  example: z.string().min(1, 'El ejemplo es requerido'),
  partOfSpeech: z.enum(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'other']),
  difficulty: z.number().int().min(1).max(5)
});

export const VocabularyResponseSchema = z.object({
  vocabulary: z.array(VocabularyItemSchema).min(1, 'Debe haber al menos una palabra de vocabulario')
});

// Schema para validar respuestas de gramática de Gemini
export const GrammarConceptSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  explanation: z.string().min(1, 'La explicación es requerida'),
  rule: z.string().min(1, 'La regla es requerida'),
  examples: z.array(z.string()).min(1, 'Debe haber al menos un ejemplo'),
  commonMistakes: z.array(z.string()).min(1, 'Debe haber al menos un error común'),
  tips: z.array(z.string()).min(1, 'Debe haber al menos un tip')
});

export const GrammarResponseSchema = z.object({
  grammar: z.array(GrammarConceptSchema).min(1, 'Debe haber al menos un concepto gramatical')
});

// Schema para validar respuestas de ejercicios de Gemini
export const ExerciseSchema = z.object({
  type: z.enum(['fill-blank', 'multiple-choice', 'translation', 'matching', 'ordering']),
  question: z.string().min(1, 'La pregunta es requerida'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).refine(
    (val) => {
      if (typeof val === 'string') return val.length > 0;
      return val.length > 0;
    },
    'La respuesta correcta es requerida'
  ),
  explanation: z.string().min(1, 'La explicación es requerida'),
  difficulty: z.number().int().min(1).max(5)
});

export const ExerciseResponseSchema = z.object({
  exercises: z.array(ExerciseSchema).min(1, 'Debe haber al menos un ejercicio')
});

// Schema para validar la estructura completa de una lección
export const LessonGenerationSchema = z.object({
  vocabulary: VocabularyResponseSchema,
  grammar: GrammarResponseSchema,
  exercises: ExerciseResponseSchema
});

// Tipos derivados de los schemas
export type VocabularyItemType = z.infer<typeof VocabularyItemSchema>;
export type VocabularyResponseType = z.infer<typeof VocabularyResponseSchema>;
export type GrammarConceptType = z.infer<typeof GrammarConceptSchema>;
export type GrammarResponseType = z.infer<typeof GrammarResponseSchema>;
export type ExerciseType = z.infer<typeof ExerciseSchema>;
export type ExerciseResponseType = z.infer<typeof ExerciseResponseSchema>;
export type LessonGenerationType = z.infer<typeof LessonGenerationSchema>;