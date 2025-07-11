# Guía de Integración de Gemini AI para Generación de Lecciones

## Análisis de la Arquitectura Actual

Basándome en el código actual, ya tienes:
- Sistema de selección de nivel y tema (`SelectionSaver.tsx`)
- Casos de uso bien estructurados
- Adaptadores para Supabase
- Sistema de navegación que redirige automáticamente

## Propuesta de Arquitectura para Gemini AI

### 1. Entidades de Dominio Nuevas

```
src/domain/entities/
├── Lesson.ts          // Estructura de una lección completa
├── Vocabulary.ts      // Palabras y definiciones
├── Grammar.ts         // Reglas gramaticales y ejemplos
├── Exercise.ts        // Ejercicios y actividades
└── LessonContent.ts   // Contenedor de todo el contenido
```

#### Estructura de Entidades Propuesta:

**Lesson.ts**
```typescript
export interface Lesson {
  id: string;
  userId: string;
  levelId: string;
  topicId: string;
  title: string;
  description: string;
  estimatedDuration: number; // en minutos
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: 'generating' | 'ready' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

**Vocabulary.ts**
```typescript
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
}
```

**Grammar.ts**
```typescript
export interface GrammarConcept {
  id: string;
  lessonId: string;
  title: string;
  explanation: string;
  rule: string;
  examples: string[];
  commonMistakes: string[];
  tips: string[];
}
```

**Exercise.ts**
```typescript
export interface Exercise {
  id: string;
  lessonId: string;
  type: 'fill-blank' | 'multiple-choice' | 'translation' | 'matching' | 'ordering';
  question: string;
  options?: string[]; // para multiple choice
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}
```

### 2. Casos de Uso para Gemini

```
src/application/use-cases/
├── generateLesson.ts       // Orquestador principal
├── generateVocabulary.ts   // Generar palabras del tema
├── generateGrammar.ts      // Generar reglas gramaticales
├── generateExercises.ts    // Crear ejercicios interactivos
└── saveLessonContent.ts    // Persistir en Supabase
```

### 3. Adaptador de Gemini AI

```
src/infrastructure/adapters/
└── GeminiAdapter.ts
```

## Flujo de Generación Propuesto

### Paso 1: Trigger de Generación
- Cuando el usuario completa la selección (nivel + tema)
- El `SelectionSaver` dispara la generación automática
- Mostrar loading state mientras se genera

### Paso 2: Prompts Estructurados para Gemini

#### Para Vocabulario:
```
"Genera 15 palabras de vocabulario en inglés para el tema '{topic}' 
nivel '{level}'. Para cada palabra incluye:
- Palabra en inglés
- Pronunciación fonética (IPA)
- Traducción al español
- Definición en inglés simple
- Ejemplo de uso en contexto
- Parte de la oración (noun, verb, adjective, etc.)
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
}"
```

#### Para Gramática:
```
"Explica 3 conceptos gramaticales relevantes para el tema '{topic}' 
nivel '{level}'. Para cada concepto:
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
}"
```

#### Para Ejercicios:
```
"Crea 5 ejercicios interactivos para practicar '{topic}' nivel '{level}':
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
}"
```

### Paso 3: Procesamiento y Validación
- Parsear respuestas JSON de Gemini
- Validar estructura con schemas de Zod
- Manejar errores y reintentos
- Aplicar filtros de contenido apropiado

### Paso 4: Persistencia Inteligente

Estructura de base de datos en Supabase:

```sql
-- Tabla principal de lecciones
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  level_id UUID REFERENCES levels(id),
  topic_id UUID REFERENCES topics(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_duration INTEGER, -- en minutos
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  status VARCHAR(20) DEFAULT 'generating',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vocabulario de la lección
CREATE TABLE lesson_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  pronunciation VARCHAR(200),
  translation VARCHAR(200),
  definition TEXT,
  example TEXT,
  part_of_speech VARCHAR(50),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conceptos gramaticales
CREATE TABLE lesson_grammar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  explanation TEXT,
  rule TEXT,
  examples JSONB, -- array de ejemplos
  common_mistakes JSONB, -- array de errores comunes
  tips JSONB, -- array de tips
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ejercicios
CREATE TABLE lesson_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  options JSONB, -- para multiple choice
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Consideraciones Técnicas

### 1. Gestión de Costos
- **Cache de contenido generado** por (nivel + tema)
- **Reutilizar lecciones** entre usuarios con misma selección
- **Límites de generación** por usuario/día
- **Fallback a contenido pre-generado** si falla la generación
- **Monitoreo de uso** de API de Gemini

### 2. Calidad del Contenido
- **Prompts específicos por nivel** (A1, A2, B1, B2, C1, C2)
- **Validación de respuestas** con schemas estrictos de Zod
- **Sistema de rating/feedback** del usuario
- **Moderación automática** de contenido
- **Revisión manual** de contenido generado

### 3. Performance
- **Generación asíncrona** en background
- **Streaming de respuestas** para UX fluida
- **Pre-generación** de contenido popular
- **CDN** para recursos estáticos
- **Paginación** de ejercicios largos

### 4. Experiencia de Usuario
- **Progress indicators** durante generación
- **Preview del contenido** antes de guardar
- **Opción de regenerar** secciones específicas
- **Personalización** basada en progreso del usuario
- **Modo offline** con contenido pre-descargado

## Integración con el Sistema Actual

### Modificaciones Necesarias:

#### 1. En `SelectionSaver.tsx`:
```typescript
// Agregar después de saveSelection exitoso
const handleGenerateLesson = async () => {
  try {
    setIsGenerating(true);
    await generateLessonUseCase({
      userId: user.id,
      levelId: selectedLevel.id,
      topicId: selectedTopic.id
    });
    // Redirigir a la lección cuando esté lista
    navigate('/lesson');
  } catch (error) {
    // Manejar error
  } finally {
    setIsGenerating(false);
  }
};
```

#### 2. En `AppRouter.tsx`:
```typescript
// Nueva ruta para generación
<Route 
  path="/lesson/generating" 
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <LessonGeneratingPage />
    </ProtectedRoute>
  } 
/>

// Verificar si la lección existe antes de mostrar
<Route 
  path="/lesson" 
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <LessonPageWithCheck />
    </ProtectedRoute>
  } 
/>
```

#### 3. En `LessonPage.tsx`:
```typescript
// Consumir contenido generado
const { lesson, vocabulary, grammar, exercises } = useLessonContent();

// Interfaz para mostrar:
// - Vocabulario con pronunciación
// - Conceptos gramaticales
// - Ejercicios interactivos
// - Progreso del usuario
```

## Fases de Implementación Sugeridas

### Fase 1: MVP (2-3 semanas)
- ✅ Entidades básicas (Lesson, Vocabulary)
- ✅ Adaptador de Gemini para vocabulario
- ✅ Caso de uso de generación simple
- ✅ Guardado directo en Supabase
- ✅ UI básica para mostrar vocabulario

### Fase 2: Contenido Completo (3-4 semanas)
- ✅ Agregar Grammar y Exercise entities
- ✅ Prompts mejorados con contexto
- ✅ Sistema de cache básico
- ✅ UI completa para gramática y ejercicios
- ✅ Validación con Zod schemas

### Fase 3: Optimización (2-3 semanas)
- ✅ Cache inteligente y reutilización
- ✅ Pre-generación de contenido popular
- ✅ Analytics y métricas
- ✅ Sistema de feedback
- ✅ Mejora continua de prompts

### Fase 4: Avanzado (3-4 semanas)
- ✅ Personalización por progreso del usuario
- ✅ Ejercicios adaptativos
- ✅ Gamificación
- ✅ Modo offline
- ✅ Integración con speech-to-text

## Estructura de Archivos Propuesta

```
src/
├── domain/
│   ├── entities/
│   │   ├── Lesson.ts
│   │   ├── Vocabulary.ts
│   │   ├── Grammar.ts
│   │   ├── Exercise.ts
│   │   └── LessonContent.ts
│   └── schemas/
│       ├── lessonSchemas.ts
│       └── geminiResponseSchemas.ts
├── application/
│   ├── use-cases/
│   │   ├── generateLesson.ts
│   │   ├── generateVocabulary.ts
│   │   ├── generateGrammar.ts
│   │   ├── generateExercises.ts
│   │   ├── saveLessonContent.ts
│   │   └── getLessonContent.ts
│   └── hooks/
│       ├── useLessonGeneration.ts
│       └── useLessonContent.ts
├── infrastructure/
│   ├── adapters/
│   │   ├── GeminiAdapter.ts
│   │   ├── SupabaseLessonAdapter.ts
│   │   └── LessonCacheAdapter.ts
│   └── config/
│       └── geminiConfig.ts
└── ui/
    ├── pages/
    │   ├── LessonGeneratingPage.tsx
    │   └── LessonContentPage.tsx
    └── components/
        ├── VocabularySection.tsx
        ├── GrammarSection.tsx
        ├── ExerciseSection.tsx
        └── LessonProgress.tsx
```

## Ventajas de esta Arquitectura

- **Escalable**: Fácil agregar nuevos tipos de contenido
- **Mantenible**: Separación clara de responsabilidades
- **Eficiente**: Reutilización y cache de contenido
- **Flexible**: Personalización por usuario y progreso
- **Robusta**: Manejo de errores y fallbacks
- **Testeable**: Casos de uso aislados y mockeable
- **Performante**: Generación asíncrona y cache

## Configuración de Gemini AI

### Variables de Entorno
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-pro
GEMINI_MAX_TOKENS=8192
GEMINI_TEMPERATURE=0.7
```

### Límites y Quotas
- **Requests por minuto**: 60
- **Tokens por request**: 8192
- **Cache TTL**: 24 horas
- **Reintentos**: 3 con backoff exponencial

## Métricas y Monitoreo

### KPIs a Trackear
- Tiempo de generación promedio
- Tasa de éxito de generación
- Calidad del contenido (rating usuarios)
- Uso de cache vs generación nueva
- Costo por lección generada
- Engagement con el contenido

### Alertas
- Fallas consecutivas de generación
- Tiempo de respuesta > 30 segundos
- Uso excesivo de API quota
- Contenido inapropiado detectado

## Próximos Pasos

1. **Configurar API de Gemini** y variables de entorno
2. **Crear entidades básicas** en domain/entities
3. **Implementar adaptador de Gemini** con prompts simples
4. **Crear caso de uso de generación** básico
5. **Configurar tablas en Supabase** para lecciones
6. **Integrar con SelectionSaver** para trigger automático
7. **Crear UI básica** para mostrar contenido generado
8. **Implementar cache** y optimizaciones

---

*Esta guía será actualizada conforme se implemente cada fase del proyecto.*