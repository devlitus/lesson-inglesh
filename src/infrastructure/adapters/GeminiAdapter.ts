import { GoogleGenAI } from '@google/genai';
import { geminiConfig, validateGeminiConfig } from '../config/geminiConfig';
import {
  VocabularyResponseSchema,
  GrammarResponseSchema,
  ExerciseResponseSchema,
  type VocabularyResponseType,
  type GrammarResponseType,
  type ExerciseResponseType
} from '../../domain/schemas/geminiResponseSchemas';
import type { Level } from '../../domain/entities/Level';
import type { Topic } from '../../domain/entities/Topic';

export class GeminiAdapter {
  private genAI: GoogleGenAI;

  constructor() {
    // Validar configuración
    if (!validateGeminiConfig()) {
      throw new Error('Configuración de Gemini AI inválida. Verifique las variables de entorno.');
    }
    
    this.genAI = new GoogleGenAI({ apiKey: geminiConfig.apiKey });
  }

  /**
   * Genera vocabulario para un tema y nivel específico
   */
  async generateVocabulary(level: Level, topic: Topic): Promise<VocabularyResponseType> {
    const prompt = this.createVocabularyPrompt(level, topic);
    
    try {
      const result = await this.callGeminiWithRetry(prompt);
      const parsedResponse = JSON.parse(result);
      
      // Validar la respuesta con Zod
      const validatedResponse = VocabularyResponseSchema.parse(parsedResponse);
      
      return validatedResponse;
    } catch (error) {
      throw new Error(`Error generando vocabulario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera conceptos gramaticales para un tema y nivel específico
   */
  async generateGrammar(level: Level, topic: Topic): Promise<GrammarResponseType> {
    const prompt = this.createGrammarPrompt(level, topic);
    
    try {
      const result = await this.callGeminiWithRetry(prompt);
      const parsedResponse = JSON.parse(result);
      
      // Validar la respuesta con Zod
      const validatedResponse = GrammarResponseSchema.parse(parsedResponse);
      
      return validatedResponse;
    } catch (error) {
      throw new Error(`Error generando gramática: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera ejercicios para un tema y nivel específico
   */
  async generateExercises(level: Level, topic: Topic): Promise<ExerciseResponseType> {
    const prompt = this.createExercisesPrompt(level, topic);
    
    try {
      const result = await this.callGeminiWithRetry(prompt);
      const parsedResponse = JSON.parse(result);
      
      // Validar la respuesta con Zod
      const validatedResponse = ExerciseResponseSchema.parse(parsedResponse);
      
      return validatedResponse;
    } catch (error) {
      throw new Error(`Error generando ejercicios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crea el prompt para generar vocabulario
   */
  private createVocabularyPrompt(level: Level, topic: Topic): string {
    return `Genera 15 palabras de vocabulario en inglés para el tema "${topic.title}" nivel "${level.title}". Para cada palabra incluye:
- Palabra en inglés
- Pronunciación fonética (IPA)
- Traducción al español
- Definición en inglés simple
- Ejemplo de uso en contexto
- Parte de la oración (noun, verb, adjective, adverb, preposition, other)
- Nivel de dificultad (1-5)

Formato de respuesta en JSON:
{
  "vocabulary": [
    {
      "word": "example",
      "pronunciation": "/ɪɡˈzæmpəl/",
      "translation": "ejemplo",
      "definition": "a thing characteristic of its kind",
      "example": "This is a good example of modern art.",
      "partOfSpeech": "noun",
      "difficulty": 3
    }
  ]
}

Responde ÚNICAMENTE con el JSON válido, sin texto adicional.`;
  }

  /**
   * Crea el prompt para generar gramática
   */
  private createGrammarPrompt(level: Level, topic: Topic): string {
    return `Explica 3 conceptos gramaticales relevantes para el tema "${topic.title}" nivel "${level.title}". Para cada concepto:
- Título del concepto
- Explicación clara y simple
- Regla gramatical específica
- 3 ejemplos prácticos
- Errores comunes a evitar
- Tips para recordar

Formato de respuesta en JSON:
{
  "grammar": [
    {
      "title": "Present Simple",
      "explanation": "Used for habits and general truths",
      "rule": "Subject + base verb (+ s/es for 3rd person)",
      "examples": [
        "I work every day.",
        "She likes coffee.",
        "The sun rises in the east."
      ],
      "commonMistakes": [
        "Forgetting 's' in 3rd person: 'He work' ❌ → 'He works' ✅"
      ],
      "tips": [
        "Remember: I/You/We/They + verb, He/She/It + verb+s"
      ]
    }
  ]
}

Responde ÚNICAMENTE con el JSON válido, sin texto adicional.`;
  }

  /**
   * Crea el prompt para generar ejercicios
   */
  private createExercisesPrompt(level: Level, topic: Topic): string {
    return `Crea 5 ejercicios interactivos para practicar "${topic.title}" nivel "${level.title}":
- 2 ejercicios de completar espacios (fill-blank)
- 2 ejercicios de selección múltiple (multiple-choice)
- 1 ejercicio de traducción (translation)

Para cada ejercicio incluye:
- Tipo de ejercicio
- Pregunta o enunciado
- Opciones (si aplica)
- Respuesta correcta
- Explicación de la respuesta
- Nivel de dificultad (1-5)

Formato de respuesta en JSON:
{
  "exercises": [
    {
      "type": "fill-blank",
      "question": "I _____ to work every day.",
      "correctAnswer": "go",
      "explanation": "Present simple for daily habits uses base verb.",
      "difficulty": 2
    },
    {
      "type": "multiple-choice",
      "question": "Which sentence is correct?",
      "options": [
        "She go to school.",
        "She goes to school.",
        "She going to school."
      ],
      "correctAnswer": "She goes to school.",
      "explanation": "Third person singular requires 's' ending.",
      "difficulty": 3
    }
  ]
}

Responde ÚNICAMENTE con el JSON válido, sin texto adicional.`;
  }

  /**
   * Llama a Gemini con reintentos automáticos
   */
  private async callGeminiWithRetry(prompt: string): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= geminiConfig.maxRetries; attempt++) {
      try {
        const result = await this.genAI.models.generateContent({
          model: geminiConfig.model,
          contents: prompt,
        });
        
        const text = result.text;
        
        if (!text) {
          throw new Error('Respuesta vacía de Gemini AI');
        }
        
        return text;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        
        if (attempt < geminiConfig.maxRetries) {
          console.warn(`Intento ${attempt} falló, reintentando en ${geminiConfig.retryDelay}ms...`, lastError.message);
          await this.delay(geminiConfig.retryDelay * attempt); // Backoff exponencial
        }
      }
    }
    
    throw new Error(`Error después de ${geminiConfig.maxRetries} intentos: ${lastError?.message || 'Error desconocido'}`);
  }

  /**
   * Función de delay para los reintentos
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instancia singleton del adaptador
export const geminiAdapter = new GeminiAdapter();