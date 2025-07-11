import { z } from 'zod';

// Schema para crear una lección
export const CreateLessonSchema = z.object({
  userId: z.string().uuid('ID de usuario debe ser un UUID válido'),
  levelId: z.string().uuid('ID de nivel debe ser un UUID válido'),
  topicId: z.string().uuid('ID de tema debe ser un UUID válido'),
  title: z.string().min(1, 'El título es requerido').max(255, 'El título no puede exceder 255 caracteres'),
  description: z.string().min(1, 'La descripción es requerida'),
  estimatedDuration: z.number().int().min(1, 'La duración debe ser al menos 1 minuto').max(180, 'La duración no puede exceder 180 minutos'),
  difficulty: z.number().int().min(1).max(5, 'La dificultad debe estar entre 1 y 5')
});

// Schema para la lección completa
export const LessonSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  levelId: z.string().uuid(),
  topicId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  estimatedDuration: z.number().int().min(1).max(180),
  difficulty: z.number().int().min(1).max(5),
  status: z.enum(['generating', 'ready', 'completed']),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Schema para crear vocabulario
export const CreateVocabularySchema = z.object({
  lessonId: z.string().uuid('ID de lección debe ser un UUID válido'),
  word: z.string().min(1, 'La palabra es requerida').max(100, 'La palabra no puede exceder 100 caracteres'),
  pronunciation: z.string().min(1, 'La pronunciación es requerida').max(200, 'La pronunciación no puede exceder 200 caracteres'),
  translation: z.string().min(1, 'La traducción es requerida').max(200, 'La traducción no puede exceder 200 caracteres'),
  definition: z.string().min(1, 'La definición es requerida'),
  example: z.string().min(1, 'El ejemplo es requerido'),
  difficulty: z.number().int().min(1).max(5),
  partOfSpeech: z.enum(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'other'])
});

// Schema para crear gramática
export const CreateGrammarSchema = z.object({
  lessonId: z.string().uuid('ID de lección debe ser un UUID válido'),
  title: z.string().min(1, 'El título es requerido').max(255, 'El título no puede exceder 255 caracteres'),
  explanation: z.string().min(1, 'La explicación es requerida'),
  rule: z.string().min(1, 'La regla es requerida'),
  examples: z.array(z.string().min(1)).min(1, 'Debe haber al menos un ejemplo'),
  commonMistakes: z.array(z.string().min(1)).min(1, 'Debe haber al menos un error común'),
  tips: z.array(z.string().min(1)).min(1, 'Debe haber al menos un tip')
});

// Schema para crear ejercicios
export const CreateExerciseSchema = z.object({
  lessonId: z.string().uuid('ID de lección debe ser un UUID válido'),
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

// Tipos derivados de los schemas
export type CreateLessonType = z.infer<typeof CreateLessonSchema>;
export type LessonType = z.infer<typeof LessonSchema>;
export type CreateVocabularyType = z.infer<typeof CreateVocabularySchema>;
export type CreateGrammarType = z.infer<typeof CreateGrammarSchema>;
export type CreateExerciseType = z.infer<typeof CreateExerciseSchema>;