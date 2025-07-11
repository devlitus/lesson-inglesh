import { GeminiAdapter } from '../../infrastructure/adapters/GeminiAdapter';
import { SupabaseLessonAdapter } from '../../infrastructure/adapters/SupabaseLessonAdapter';
import { SupabaseLevelAdapter } from '../../infrastructure/adapters/SupabaseLevelAdapter';
import { SupabaseTopicsAdapter } from '../../infrastructure/adapters/SupabaseTopicsAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';

import type { LessonContent } from '../../domain/entities/LessonContent';
import type { CreateVocabularyInput } from '../../domain/entities/Vocabulary';
import type { CreateGrammarInput } from '../../domain/entities/Grammar';
import type { CreateExerciseInput } from '../../domain/entities/Exercise';

export interface GenerateLessonInput {
  userId: string;
  levelId: string;
  topicId: string;
}

/**
 * Caso de uso principal para generar una lección completa con Gemini AI
 * @param input - Datos del usuario, nivel y tema
 * @returns Promise<LessonContent> - La lección completa generada
 * @throws Error si falla la generación o si ya existe una lección
 */
export async function generateLessonUseCase(input: GenerateLessonInput): Promise<LessonContent> {
  try {
    // Validar que el usuario esté autenticado
    const { user } = useUserStore.getState();
    if (!user || user.id !== input.userId) {
      throw new Error('Usuario no autenticado o ID de usuario inválido.');
    }

    // Verificar si ya existe una lección para esta combinación
    const existingLesson = await SupabaseLessonAdapter.getLessonByUserLevelTopic(
      input.userId,
      input.levelId,
      input.topicId
    );

    if (existingLesson && existingLesson.status === 'ready') {
      // Si ya existe una lección lista, devolver su contenido
      const content = await SupabaseLessonAdapter.getLessonContent(existingLesson.id);
      if (content) {
        return content;
      }
    }

    // Obtener información del nivel y tema
    const [level, topic] = await Promise.all([
      SupabaseLevelAdapter.getLevelById(input.levelId),
      SupabaseTopicsAdapter.getTopicById(input.topicId)
    ]);

    if (!level) {
      throw new Error(`Nivel con ID ${input.levelId} no encontrado.`);
    }

    if (!topic) {
      throw new Error(`Tema con ID ${input.topicId} no encontrado.`);
    }

    // Crear la lección en estado 'generating'
    const lesson = await SupabaseLessonAdapter.createLesson({
      userId: input.userId,
      levelId: input.levelId,
      topicId: input.topicId,
      title: `${level.title}: ${topic.title}`,
      description: `Lección de ${topic.title} para nivel ${level.title}`,
      estimatedDuration: 30, // Duración estimada por defecto
      difficulty: getDifficultyFromLevel(level.title)
    });

    console.log('Lección creada, iniciando generación de contenido...', {
      lessonId: lesson.id,
      level: level.title,
      topic: topic.title
    });

    try {
      // Inicializar el adaptador de Gemini
      const geminiAdapter = new GeminiAdapter();

      // Generar contenido en paralelo
      const [vocabularyResponse, grammarResponse, exercisesResponse] = await Promise.all([
        geminiAdapter.generateVocabulary(level, topic),
        geminiAdapter.generateGrammar(level, topic),
        geminiAdapter.generateExercises(level, topic)
      ]);

      console.log('Contenido generado por Gemini AI:', {
        vocabularyCount: vocabularyResponse.vocabulary.length,
        grammarCount: grammarResponse.grammar.length,
        exercisesCount: exercisesResponse.exercises.length
      });

      // Preparar datos para guardar en Supabase
      const vocabularyItems: CreateVocabularyInput[] = vocabularyResponse.vocabulary.map(item => ({
       lessonId: lesson.id,
       word: item.word,
       pronunciation: item.pronunciation,
       translation: item.translation,
       definition: item.definition,
       example: item.example,
       difficulty: item.difficulty as 1 | 2 | 3 | 4 | 5,
       partOfSpeech: item.partOfSpeech
     }));

      const grammarConcepts: CreateGrammarInput[] = grammarResponse.grammar.map(concept => ({
        lessonId: lesson.id,
        title: concept.title,
        explanation: concept.explanation,
        rule: concept.rule,
        examples: concept.examples,
        commonMistakes: concept.commonMistakes,
        tips: concept.tips
      }));

      const exercises: CreateExerciseInput[] = exercisesResponse.exercises.map(exercise => ({
        lessonId: lesson.id,
        type: exercise.type,
        question: exercise.question,
        options: exercise.options,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
        difficulty: exercise.difficulty as 1 | 2 | 3 | 4 | 5
      }));

      // Guardar todo el contenido en Supabase
      const [savedVocabulary, savedGrammar, savedExercises] = await Promise.all([
        SupabaseLessonAdapter.saveVocabulary(vocabularyItems),
        SupabaseLessonAdapter.saveGrammar(grammarConcepts),
        SupabaseLessonAdapter.saveExercises(exercises)
      ]);

      // Actualizar el estado de la lección a 'ready'
      const updatedLesson = await SupabaseLessonAdapter.updateLessonStatus(lesson.id, 'ready');

      console.log('Lección generada y guardada exitosamente:', {
        lessonId: updatedLesson.id,
        vocabularyCount: savedVocabulary.length,
        grammarCount: savedGrammar.length,
        exercisesCount: savedExercises.length
      });

      return {
        lesson: updatedLesson,
        vocabulary: savedVocabulary,
        grammar: savedGrammar,
        exercises: savedExercises
      };

    } catch (generationError) {
      // Si falla la generación, actualizar el estado de la lección
      await SupabaseLessonAdapter.updateLessonStatus(lesson.id, 'generating');
      throw generationError;
    }

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al generar la lección: ${error.message}`
      : 'Error desconocido al generar la lección';
    
    console.error('Error en generateLessonUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Obtiene el contenido de una lección existente
 * @param lessonId - ID de la lección
 * @returns Promise<LessonContent | null> - El contenido de la lección o null si no existe
 */
export async function getLessonContentUseCase(lessonId: string): Promise<LessonContent | null> {
  try {
    const content = await SupabaseLessonAdapter.getLessonContent(lessonId);
    return content;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al obtener el contenido de la lección: ${error.message}`
      : 'Error desconocido al obtener el contenido de la lección';
    
    console.error('Error en getLessonContentUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Obtiene una lección por usuario, nivel y tema
 * @param userId - ID del usuario
 * @param levelId - ID del nivel
 * @param topicId - ID del tema
 * @returns Promise<LessonContent | null> - El contenido de la lección o null si no existe
 */
export async function getLessonByUserLevelTopicUseCase(
  userId: string,
  levelId: string,
  topicId: string
): Promise<LessonContent | null> {
  try {
    const lesson = await SupabaseLessonAdapter.getLessonByUserLevelTopic(userId, levelId, topicId);
    
    if (!lesson) {
      return null;
    }

    const content = await SupabaseLessonAdapter.getLessonContent(lesson.id);
    return content;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al obtener la lección: ${error.message}`
      : 'Error desconocido al obtener la lección';
    
    console.error('Error en getLessonByUserLevelTopicUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Determina la dificultad basada en el nivel
 */
function getDifficultyFromLevel(levelTitle: string): 1 | 2 | 3 | 4 | 5 {
  const title = levelTitle.toLowerCase();
  
  if (title.includes('a1') || title.includes('beginner')) return 1;
  if (title.includes('a2') || title.includes('elementary')) return 2;
  if (title.includes('b1') || title.includes('intermediate')) return 3;
  if (title.includes('b2') || title.includes('upper')) return 4;
  if (title.includes('c1') || title.includes('c2') || title.includes('advanced')) return 5;
  
  return 3; // Por defecto intermedio
}