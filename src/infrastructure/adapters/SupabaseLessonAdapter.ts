import { supabase } from '../../shared/config/supabaseClient';
import type { Lesson, CreateLessonInput } from '../../domain/entities/Lesson';
import type { VocabularyItem, CreateVocabularyInput } from '../../domain/entities/Vocabulary';
import type { GrammarConcept, CreateGrammarInput } from '../../domain/entities/Grammar';
import type { Exercise, CreateExerciseInput } from '../../domain/entities/Exercise';
import type { LessonContent } from '../../domain/entities/LessonContent';

// Database row types
interface LessonRow {
  id: string;
  user_id: string;
  level_id: string;
  topic_id: string;
  title: string;
  description: string;
  estimated_duration: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: 'generating' | 'ready' | 'completed';
  created_at: string;
  updated_at: string;
}

interface VocabularyRow {
  id: string;
  lesson_id: string;
  word: string;
  pronunciation: string;
  translation: string;
  definition: string;
  example: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  part_of_speech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'other';
  created_at?: string;
}

interface GrammarRow {
  id: string;
  lesson_id: string;
  title: string;
  explanation: string;
  rule: string;
  examples: string[];
  common_mistakes: string[];
  tips: string[];
  created_at?: string;
}

interface ExerciseRow {
  id: string;
  lesson_id: string;
  type: 'fill-blank' | 'multiple-choice' | 'translation' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  created_at?: string;
}

export const SupabaseLessonAdapter = {
  /**
   * Crea una nueva lección
   */
  async createLesson(input: CreateLessonInput): Promise<Lesson> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          user_id: input.userId,
          level_id: input.levelId,
          topic_id: input.topicId,
          title: input.title,
          description: input.description,
          estimated_duration: input.estimatedDuration,
          difficulty: input.difficulty,
          status: 'generating'
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error al crear la lección: ${error.message}`);
      }
      
      return this.mapLessonFromDB(data);
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al crear la lección'
      );
    }
  },

  /**
   * Obtiene una lección por ID
   */
  async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Error al obtener la lección: ${error.message}`);
      }
      
      return data ? this.mapLessonFromDB(data) : null;
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener la lección'
      );
    }
  },

  /**
   * Obtiene lecciones por usuario, nivel y tema
   */
  async getLessonByUserLevelTopic(userId: string, levelId: string, topicId: string): Promise<Lesson | null> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', userId)
        .eq('level_id', levelId)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Error al obtener la lección: ${error.message}`);
      }
      
      return data ? this.mapLessonFromDB(data) : null;
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener la lección'
      );
    }
  },

  /**
   * Actualiza el estado de una lección
   */
  async updateLessonStatus(lessonId: string, status: 'generating' | 'ready' | 'completed'): Promise<Lesson> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error al actualizar el estado de la lección: ${error.message}`);
      }
      
      return this.mapLessonFromDB(data);
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al actualizar el estado de la lección'
      );
    }
  },

  /**
   * Obtiene el contenido completo de una lección
   */
  async getLessonContent(lessonId: string): Promise<LessonContent | null> {
    try {
      // Obtener la lección
      const lesson = await this.getLessonById(lessonId);
      if (!lesson) {
        return null;
      }

      // Obtener vocabulario, gramática y ejercicios en paralelo
      const [vocabulary, grammar, exercises] = await Promise.all([
        this.getVocabularyByLessonId(lessonId),
        this.getGrammarByLessonId(lessonId),
        this.getExercisesByLessonId(lessonId)
      ]);

      return {
        lesson,
        vocabulary,
        grammar,
        exercises
      };
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener el contenido de la lección'
      );
    }
  },

  /**
   * Guarda vocabulario de una lección
   */
  async saveVocabulary(vocabularyItems: CreateVocabularyInput[]): Promise<VocabularyItem[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert(
          vocabularyItems.map(item => ({
            lesson_id: item.lessonId,
            word: item.word,
            pronunciation: item.pronunciation,
            translation: item.translation,
            definition: item.definition,
            example: item.example,
            part_of_speech: item.partOfSpeech,
            difficulty: item.difficulty
          }))
        )
        .select();
      
      if (error) {
        throw new Error(`Error al guardar vocabulario: ${error.message}`);
      }
      
      return data.map(this.mapVocabularyFromDB);
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al guardar vocabulario'
      );
    }
  },

  /**
   * Obtiene vocabulario por ID de lección
   */
  async getVocabularyByLessonId(lessonId: string): Promise<VocabularyItem[]> {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw new Error(`Error al obtener vocabulario: ${error.message}`);
      }
      
      return data.map(this.mapVocabularyFromDB);
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener vocabulario'
      );
    }
  },

  /**
   * Guarda conceptos gramaticales de una lección
   */
  async saveGrammar(grammarConcepts: CreateGrammarInput[]): Promise<GrammarConcept[]> {
    try {
      const { data, error } = await supabase
        .from('grammar')
        .insert(
          grammarConcepts.map(concept => ({
            lesson_id: concept.lessonId,
            title: concept.title,
            explanation: concept.explanation,
            rule: concept.rule,
            examples: concept.examples,
            common_mistakes: concept.commonMistakes,
            tips: concept.tips
          }))
        )
        .select();
      
      if (error) {
        throw new Error(`Error al guardar gramática: ${error.message}`);
      }
      
      return data.map(this.mapGrammarFromDB);
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al guardar gramática'
      );
    }
  },

  /**
   * Obtiene gramática por ID de lección
   */
  async getGrammarByLessonId(lessonId: string): Promise<GrammarConcept[]> {
    try {
      const { data, error } = await supabase
        .from('grammar')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw new Error(`Error al obtener gramática: ${error.message}`);
      }
      
      return data.map(this.mapGrammarFromDB);
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener gramática'
      );
    }
  },

  /**
   * Guarda ejercicios de una lección
   */
  async saveExercises(exercises: CreateExerciseInput[]): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert(
          exercises.map(exercise => ({
            lesson_id: exercise.lessonId,
            type: exercise.type,
            question: exercise.question,
            options: exercise.options || null,
            correct_answer: typeof exercise.correctAnswer === 'string' 
              ? exercise.correctAnswer 
              : JSON.stringify(exercise.correctAnswer),
            explanation: exercise.explanation,
            difficulty: exercise.difficulty
          }))
        )
        .select();
      
      if (error) {
        throw new Error(`Error al guardar ejercicios: ${error.message}`);
      }
      
      return data.map(this.mapExerciseFromDB);
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al guardar ejercicios'
      );
    }
  },

  /**
   * Obtiene ejercicios por ID de lección
   */
  async getExercisesByLessonId(lessonId: string): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw new Error(`Error al obtener ejercicios: ${error.message}`);
      }
      
      return data.map(this.mapExerciseFromDB);
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener ejercicios'
      );
    }
  },

  // Métodos de mapeo de datos
  mapLessonFromDB(data: LessonRow): Lesson {
    return {
      id: data.id,
      userId: data.user_id,
      levelId: data.level_id,
      topicId: data.topic_id,
      title: data.title,
      description: data.description,
      estimatedDuration: data.estimated_duration,
      difficulty: data.difficulty,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  mapVocabularyFromDB(data: VocabularyRow): VocabularyItem {
    return {
      id: data.id,
      lessonId: data.lesson_id,
      word: data.word,
      pronunciation: data.pronunciation,
      translation: data.translation,
      definition: data.definition,
      example: data.example,
      difficulty: data.difficulty,
      partOfSpeech: data.part_of_speech,
      createdAt: data.created_at ? new Date(data.created_at) : undefined
    };
  },

  mapGrammarFromDB(data: GrammarRow): GrammarConcept {
    return {
      id: data.id,
      lessonId: data.lesson_id,
      title: data.title,
      explanation: data.explanation,
      rule: data.rule,
      examples: data.examples,
      commonMistakes: data.common_mistakes,
      tips: data.tips,
      createdAt: data.created_at ? new Date(data.created_at) : undefined
    };
  },

  mapExerciseFromDB(data: ExerciseRow): Exercise {
    let correctAnswer: string | string[];
    try {
      // Intentar parsear como JSON, si falla usar como string
      correctAnswer = JSON.parse(data.correct_answer);
    } catch {
      correctAnswer = data.correct_answer;
    }

    return {
      id: data.id,
      lessonId: data.lesson_id,
      type: data.type,
      question: data.question,
      options: data.options,
      correctAnswer,
      explanation: data.explanation,
      difficulty: data.difficulty,
      createdAt: data.created_at ? new Date(data.created_at) : undefined
    };
  }
};