import { GeminiAdapter } from '../../infrastructure/adapters/GeminiAdapter';
import { SupabaseLessonAdapter } from '../../infrastructure/adapters/SupabaseLessonAdapter';
import { SupabaseLevelAdapter } from '../../infrastructure/adapters/SupabaseLevelAdapter';
import { SupabaseTopicsAdapter } from '../../infrastructure/adapters/SupabaseTopicsAdapter';
import type { Exercise, CreateExerciseInput } from '../../domain/entities/Exercise';



export interface GenerateExercisesInput {
  levelId: string;
  topicId: string;
  lessonId?: string;
  exerciseTypes?: string[]; // Tipos específicos de ejercicios a generar
}

/**
 * Caso de uso para generar ejercicios usando Gemini AI
 * @param input - Datos del nivel, tema y opcionalmente lección
 * @returns Promise<Exercise[]> - Lista de ejercicios generados
 * @throws Error si falla la generación
 */
export async function generateExercisesUseCase(input: GenerateExercisesInput): Promise<Exercise[]> {
  try {
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

    console.log('Generando ejercicios para:', {
      level: level.title,
      topic: topic.title,
      lessonId: input.lessonId,
      exerciseTypes: input.exerciseTypes
    });

    // Inicializar el adaptador de Gemini
    const geminiAdapter = new GeminiAdapter();

    // Generar ejercicios
    const exercisesResponse = await geminiAdapter.generateExercises(level, topic);

    // Filtrar por tipos específicos si se proporcionan
    let filteredExercises = exercisesResponse.exercises;
    if (input.exerciseTypes && input.exerciseTypes.length > 0) {
      filteredExercises = exercisesResponse.exercises.filter(exercise => 
        input.exerciseTypes!.includes(exercise.type)
      );
    }

    console.log('Ejercicios generados:', {
      total: exercisesResponse.exercises.length,
      filtered: filteredExercises.length,
      types: [...new Set(filteredExercises.map(e => e.type))]
    });

    // Si se proporciona lessonId, guardar en Supabase
    if (input.lessonId) {
      const exercises: CreateExerciseInput[] = filteredExercises.map(exercise => ({
        lessonId: input.lessonId!,
        type: exercise.type,
        question: exercise.question,
        options: exercise.options,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
        difficulty: exercise.difficulty as 1 | 2 | 3 | 4 | 5
      }));

      const savedExercises = await SupabaseLessonAdapter.saveExercises(exercises);
      
      console.log('Ejercicios guardados en Supabase:', {
        lessonId: input.lessonId,
        count: savedExercises.length
      });

      return savedExercises;
    }

    // Si no hay lessonId, devolver solo los datos generados (sin IDs de BD)
    return filteredExercises.map(exercise => ({
      id: '', // Temporal, se asignará al guardar
      lessonId: input.lessonId || '',
      type: exercise.type,
      question: exercise.question,
      options: exercise.options,
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation,
      difficulty: exercise.difficulty as 1 | 2 | 3 | 4 | 5,
      createdAt: new Date()
    }));

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al generar ejercicios: ${error.message}`
      : 'Error desconocido al generar ejercicios';
    
    console.error('Error en generateExercisesUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para obtener ejercicios de una lección
 * @param lessonId - ID de la lección
 * @returns Promise<Exercise[]> - Lista de ejercicios
 */
export async function getExercisesByLessonUseCase(lessonId: string): Promise<Exercise[]> {
  try {
    const exercises = await SupabaseLessonAdapter.getExercisesByLessonId(lessonId);
    return exercises;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al obtener ejercicios: ${error.message}`
      : 'Error desconocido al obtener ejercicios';
    
    console.error('Error en getExercisesByLessonUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para regenerar ejercicios de una lección existente
 * @param lessonId - ID de la lección
 * @param exerciseTypes - Tipos específicos de ejercicios a regenerar (opcional)
 * @returns Promise<Exercise[]> - Lista de ejercicios regenerados
 */
export async function regenerateExercisesUseCase(
  lessonId: string, 
  exerciseTypes?: string[]
): Promise<Exercise[]> {
  try {
    // Obtener la lección para conocer el nivel y tema
    const lesson = await SupabaseLessonAdapter.getLessonById(lessonId);
    
    if (!lesson) {
      throw new Error(`Lección con ID ${lessonId} no encontrada.`);
    }

    console.log('Regenerando ejercicios para lección:', {
      lessonId,
      levelId: lesson.levelId,
      topicId: lesson.topicId,
      exerciseTypes
    });

    // Generar nuevos ejercicios
    const newExercises = await generateExercisesUseCase({
      levelId: lesson.levelId,
      topicId: lesson.topicId,
      lessonId: lessonId,
      exerciseTypes
    });

    console.log('Ejercicios regenerados exitosamente:', {
      lessonId,
      count: newExercises.length
    });

    return newExercises;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al regenerar ejercicios: ${error.message}`
      : 'Error desconocido al regenerar ejercicios';
    
    console.error('Error en regenerateExercisesUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para previsualizar ejercicios sin guardarlos
 * @param levelId - ID del nivel
 * @param topicId - ID del tema
 * @param exerciseTypes - Tipos específicos de ejercicios (opcional)
 * @returns Promise<Exercise[]> - Lista de ejercicios para previsualización
 */
export async function previewExercisesUseCase(
  levelId: string, 
  topicId: string,
  exerciseTypes?: string[]
): Promise<Exercise[]> {
  try {
    const exercises = await generateExercisesUseCase({
      levelId,
      topicId,
      exerciseTypes
      // No se proporciona lessonId para no guardar
    });

    console.log('Ejercicios generados para previsualización:', {
      levelId,
      topicId,
      count: exercises.length,
      types: exerciseTypes
    });

    return exercises;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al previsualizar ejercicios: ${error.message}`
      : 'Error desconocido al previsualizar ejercicios';
    
    console.error('Error en previewExercisesUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para obtener ejercicios por tipo
 * @param lessonId - ID de la lección
 * @param exerciseType - Tipo de ejercicio
 * @returns Promise<Exercise[]> - Lista de ejercicios del tipo especificado
 */
export async function getExercisesByTypeUseCase(
  lessonId: string, 
  exerciseType: string
): Promise<Exercise[]> {
  try {
    const allExercises = await SupabaseLessonAdapter.getExercisesByLessonId(lessonId);
    const filteredExercises = allExercises.filter(exercise => exercise.type === exerciseType);
    
    console.log('Ejercicios filtrados por tipo:', {
      lessonId,
      exerciseType,
      total: allExercises.length,
      filtered: filteredExercises.length
    });

    return filteredExercises;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al obtener ejercicios por tipo: ${error.message}`
      : 'Error desconocido al obtener ejercicios por tipo';
    
    console.error('Error en getExercisesByTypeUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para validar una respuesta de ejercicio
 * @param exerciseId - ID del ejercicio
 * @param userAnswer - Respuesta del usuario
 * @returns Promise<{isCorrect: boolean, explanation: string}> - Resultado de la validación
 */
export async function validateExerciseAnswerUseCase(
  exerciseId: string, 
  userAnswer: string
): Promise<{isCorrect: boolean, explanation: string, correctAnswer: string}> {
  try {
    // TODO: Implementar SupabaseLessonAdapter.getExerciseById(exerciseId)
    // Por ahora, implementamos una validación básica
    console.log('Validando respuesta de ejercicio:', {
      exerciseId,
      userAnswer
    });

    // Placeholder - en una implementación real, obtendríamos el ejercicio de la BD
    return {
      isCorrect: false,
      explanation: 'Función de validación no implementada completamente.',
      correctAnswer: 'N/A'
    };

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al validar respuesta: ${error.message}`
      : 'Error desconocido al validar respuesta';
    
    console.error('Error en validateExerciseAnswerUseCase:', error);
    throw new Error(errorMessage);
  }
}