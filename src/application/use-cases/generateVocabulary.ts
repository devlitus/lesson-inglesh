import { GeminiAdapter } from '../../infrastructure/adapters/GeminiAdapter';
import { SupabaseLessonAdapter } from '../../infrastructure/adapters/SupabaseLessonAdapter';
import { SupabaseLevelAdapter } from '../../infrastructure/adapters/SupabaseLevelAdapter';
import { SupabaseTopicsAdapter } from '../../infrastructure/adapters/SupabaseTopicsAdapter';
import type { VocabularyItem, CreateVocabularyInput } from '../../domain/entities/Vocabulary';

export interface GenerateVocabularyInput {
  levelId: string;
  topicId: string;
  lessonId?: string;
}

/**
 * Caso de uso para generar vocabulario específico usando Gemini AI
 * @param input - Datos del nivel, tema y opcionalmente lección
 * @returns Promise<VocabularyItem[]> - Lista de elementos de vocabulario generados
 * @throws Error si falla la generación
 */
export async function generateVocabularyUseCase(input: GenerateVocabularyInput): Promise<VocabularyItem[]> {
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

    console.log('Generando vocabulario para:', {
      level: level.title,
      topic: topic.title,
      lessonId: input.lessonId
    });

    // Inicializar el adaptador de Gemini
    const geminiAdapter = new GeminiAdapter();

    // Generar vocabulario
    const vocabularyResponse = await geminiAdapter.generateVocabulary(level, topic);

    console.log('Vocabulario generado:', {
      count: vocabularyResponse.vocabulary.length,
      words: vocabularyResponse.vocabulary.map(v => v.word)
    });

    // Si se proporciona lessonId, guardar en Supabase
    if (input.lessonId) {
      const vocabularyItems: CreateVocabularyInput[] = vocabularyResponse.vocabulary.map(item => ({
      lessonId: input.lessonId!,
      word: item.word,
      pronunciation: item.pronunciation,
      translation: item.translation,
      definition: item.definition,
      example: item.example,
      difficulty: item.difficulty as 1 | 2 | 3 | 4 | 5,
      partOfSpeech: item.partOfSpeech,
    }));

      const savedVocabulary = await SupabaseLessonAdapter.saveVocabulary(vocabularyItems);
      
      console.log('Vocabulario guardado en Supabase:', {
        lessonId: input.lessonId,
        count: savedVocabulary.length
      });

      return savedVocabulary;
    }

    // Si no hay lessonId, devolver solo los datos generados (sin IDs de BD)
    return vocabularyResponse.vocabulary.map(item => ({
      id: '', // Temporal, se asignará al guardar
      lessonId: input.lessonId || '',
      word: item.word,
      pronunciation: item.pronunciation,
      translation: item.translation,
      definition: item.definition,
      example: item.example,
      difficulty: item.difficulty as 1 | 2 | 3 | 4 | 5,
      partOfSpeech: item.partOfSpeech,
      createdAt: new Date()
    }));

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al generar vocabulario: ${error.message}`
      : 'Error desconocido al generar vocabulario';
    
    console.error('Error en generateVocabularyUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para obtener vocabulario de una lección
 * @param lessonId - ID de la lección
 * @returns Promise<VocabularyItem[]> - Lista de elementos de vocabulario
 */
export async function getVocabularyByLessonUseCase(lessonId: string): Promise<VocabularyItem[]> {
  try {
    const vocabulary = await SupabaseLessonAdapter.getVocabularyByLessonId(lessonId);
    return vocabulary;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al obtener vocabulario: ${error.message}`
      : 'Error desconocido al obtener vocabulario';
    
    console.error('Error en getVocabularyByLessonUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para regenerar vocabulario de una lección existente
 * @param lessonId - ID de la lección
 * @returns Promise<VocabularyItem[]> - Lista de elementos de vocabulario regenerados
 */
export async function regenerateVocabularyUseCase(lessonId: string): Promise<VocabularyItem[]> {
  try {
    // Obtener la lección para conocer el nivel y tema
    const lesson = await SupabaseLessonAdapter.getLessonById(lessonId);
    
    if (!lesson) {
      throw new Error(`Lección con ID ${lessonId} no encontrada.`);
    }

    console.log('Regenerando vocabulario para lección:', {
      lessonId,
      levelId: lesson.levelId,
      topicId: lesson.topicId
    });

    // Generar nuevo vocabulario
    const newVocabulary = await generateVocabularyUseCase({
      levelId: lesson.levelId,
      topicId: lesson.topicId,
      lessonId: lessonId
    });

    console.log('Vocabulario regenerado exitosamente:', {
      lessonId,
      count: newVocabulary.length
    });

    return newVocabulary;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al regenerar vocabulario: ${error.message}`
      : 'Error desconocido al regenerar vocabulario';
    
    console.error('Error en regenerateVocabularyUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para previsualizar vocabulario sin guardarlo
 * @param levelId - ID del nivel
 * @param topicId - ID del tema
 * @returns Promise<VocabularyItem[]> - Lista de elementos de vocabulario para previsualización
 */
export async function previewVocabularyUseCase(levelId: string, topicId: string): Promise<VocabularyItem[]> {
  try {
    const vocabulary = await generateVocabularyUseCase({
      levelId,
      topicId
      // No se proporciona lessonId para no guardar
    });

    console.log('Vocabulario generado para previsualización:', {
      levelId,
      topicId,
      count: vocabulary.length
    });

    return vocabulary;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al previsualizar vocabulario: ${error.message}`
      : 'Error desconocido al previsualizar vocabulario';
    
    console.error('Error en previewVocabularyUseCase:', error);
    throw new Error(errorMessage);
  }
}