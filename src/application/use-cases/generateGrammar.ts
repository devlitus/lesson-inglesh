import { GeminiAdapter } from '../../infrastructure/adapters/GeminiAdapter';
import { SupabaseLessonAdapter } from '../../infrastructure/adapters/SupabaseLessonAdapter';
import { SupabaseLevelAdapter } from '../../infrastructure/adapters/SupabaseLevelAdapter';
import { SupabaseTopicsAdapter } from '../../infrastructure/adapters/SupabaseTopicsAdapter';
import type { GrammarConcept, CreateGrammarInput } from '../../domain/entities/Grammar';



export interface GenerateGrammarInput {
  levelId: string;
  topicId: string;
  lessonId?: string;
}

/**
 * Caso de uso para generar conceptos de gramática usando Gemini AI
 * @param input - Datos del nivel, tema y opcionalmente lección
 * @returns Promise<GrammarConcept[]> - Lista de conceptos de gramática generados
 * @throws Error si falla la generación
 */
export async function generateGrammarUseCase(input: GenerateGrammarInput): Promise<GrammarConcept[]> {
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

    console.log('Generando gramática para:', {
      level: level.title,
      topic: topic.title,
      lessonId: input.lessonId
    });

    // Inicializar el adaptador de Gemini
    const geminiAdapter = new GeminiAdapter();

    // Generar gramática
    const grammarResponse = await geminiAdapter.generateGrammar(level, topic);

    console.log('Gramática generada:', {
      count: grammarResponse.grammar.length,
      concepts: grammarResponse.grammar.map(g => g.title)
    });

    // Si se proporciona lessonId, guardar en Supabase
    if (input.lessonId) {
      const grammarConcepts: CreateGrammarInput[] = grammarResponse.grammar.map(concept => ({
        lessonId: input.lessonId!,
        title: concept.title,
        explanation: concept.explanation,
        rule: concept.rule,
        examples: concept.examples,
        commonMistakes: concept.commonMistakes,
        tips: concept.tips
      }));

      const savedGrammar = await SupabaseLessonAdapter.saveGrammar(grammarConcepts);
      
      console.log('Gramática guardada en Supabase:', {
        lessonId: input.lessonId,
        count: savedGrammar.length
      });

      return savedGrammar;
    }

    // Si no hay lessonId, devolver solo los datos generados (sin IDs de BD)
    return grammarResponse.grammar.map(concept => ({
      id: '', // Temporal, se asignará al guardar
      lessonId: input.lessonId || '',
      title: concept.title,
      explanation: concept.explanation,
      rule: concept.rule,
      examples: concept.examples,
      commonMistakes: concept.commonMistakes,
      tips: concept.tips,
      createdAt: new Date()
    }));

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al generar gramática: ${error.message}`
      : 'Error desconocido al generar gramática';
    
    console.error('Error en generateGrammarUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para obtener gramática de una lección
 * @param lessonId - ID de la lección
 * @returns Promise<GrammarConcept[]> - Lista de conceptos de gramática
 */
export async function getGrammarByLessonUseCase(lessonId: string): Promise<GrammarConcept[]> {
  try {
    const grammar = await SupabaseLessonAdapter.getGrammarByLessonId(lessonId);
    return grammar;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al obtener gramática: ${error.message}`
      : 'Error desconocido al obtener gramática';
    
    console.error('Error en getGrammarByLessonUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para regenerar gramática de una lección existente
 * @param lessonId - ID de la lección
 * @returns Promise<GrammarConcept[]> - Lista de conceptos de gramática regenerados
 */
export async function regenerateGrammarUseCase(lessonId: string): Promise<GrammarConcept[]> {
  try {
    // Obtener la lección para conocer el nivel y tema
    const lesson = await SupabaseLessonAdapter.getLessonById(lessonId);
    
    if (!lesson) {
      throw new Error(`Lección con ID ${lessonId} no encontrada.`);
    }

    console.log('Regenerando gramática para lección:', {
      lessonId,
      levelId: lesson.levelId,
      topicId: lesson.topicId
    });

    // Generar nueva gramática
    const newGrammar = await generateGrammarUseCase({
      levelId: lesson.levelId,
      topicId: lesson.topicId,
      lessonId: lessonId
    });

    console.log('Gramática regenerada exitosamente:', {
      lessonId,
      count: newGrammar.length
    });

    return newGrammar;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al regenerar gramática: ${error.message}`
      : 'Error desconocido al regenerar gramática';
    
    console.error('Error en regenerateGrammarUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para previsualizar gramática sin guardarla
 * @param levelId - ID del nivel
 * @param topicId - ID del tema
 * @returns Promise<GrammarConcept[]> - Lista de conceptos de gramática para previsualización
 */
export async function previewGrammarUseCase(levelId: string, topicId: string): Promise<GrammarConcept[]> {
  try {
    const grammar = await generateGrammarUseCase({
      levelId,
      topicId
      // No se proporciona lessonId para no guardar
    });

    console.log('Gramática generada para previsualización:', {
      levelId,
      topicId,
      count: grammar.length
    });

    return grammar;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al previsualizar gramática: ${error.message}`
      : 'Error desconocido al previsualizar gramática';
    
    console.error('Error en previewGrammarUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para obtener un concepto de gramática específico
 * @param grammarId - ID del concepto de gramática
 * @returns Promise<GrammarConcept | null> - El concepto de gramática o null si no existe
 */
export async function getGrammarConceptUseCase(grammarId: string): Promise<GrammarConcept | null> {
  try {
    // Nota: Esta función requeriría un método en SupabaseLessonAdapter
    // Por ahora, implementamos una búsqueda básica
    console.log('Obteniendo concepto de gramática:', { grammarId });
    
    // TODO: Implementar SupabaseLessonAdapter.getGrammarById(grammarId)
    // Por ahora retornamos null
    return null;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al obtener concepto de gramática: ${error.message}`
      : 'Error desconocido al obtener concepto de gramática';
    
    console.error('Error en getGrammarConceptUseCase:', error);
    throw new Error(errorMessage);
  }
}