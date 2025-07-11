# Integración de Gemini AI - Generación de Lecciones

## 🚀 Descripción General

Esta integración permite generar contenido educativo personalizado para lecciones de inglés utilizando Google Gemini AI. El sistema genera automáticamente vocabulario, conceptos de gramática y ejercicios basados en el nivel y tema seleccionados por el usuario.

## 🏗️ Arquitectura Implementada

### Entidades de Dominio
- **Lesson**: Representa una lección completa con metadatos
- **VocabularyItem**: Palabras con pronunciación, traducción y ejemplos
- **GrammarConcept**: Conceptos gramaticales con reglas y ejemplos
- **Exercise**: Ejercicios interactivos con opciones múltiples
- **LessonContent**: Agregador que combina todos los elementos

### Casos de Uso
- **generateLessonUseCase**: Orquesta la generación completa de una lección
- **generateVocabularyUseCase**: Genera vocabulario específico
- **generateGrammarUseCase**: Genera conceptos gramaticales
- **generateExercisesUseCase**: Genera ejercicios interactivos
- **getLessonContentUseCase**: Recupera contenido completo de lección

### Adaptadores
- **GeminiAdapter**: Maneja comunicación con la API de Gemini
- **SupabaseLessonAdapter**: Gestiona persistencia en base de datos

## 🔧 Configuración

### Variables de Entorno
Copia `.env.template` a `.env` y configura:

```env
# Configuración de Gemini AI
VITE_GEMINI_API_KEY=tu_api_key_de_gemini
VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_GEMINI_MAX_TOKENS=8192
VITE_GEMINI_TEMPERATURE=0.7
VITE_GEMINI_MAX_RETRIES=3
VITE_GEMINI_RETRY_DELAY=1000
```

### Base de Datos
Las tablas necesarias se crean automáticamente con la migración:
- `lessons`: Metadatos de lecciones
- `vocabulary`: Elementos de vocabulario
- `grammar`: Conceptos gramaticales
- `exercises`: Ejercicios interactivos

## 🎯 Funcionalidades

### Generación Automática
1. **Selección de Nivel y Tema**: El usuario selecciona nivel (A1-C2) y tema
2. **Generación Inteligente**: Gemini AI genera contenido personalizado
3. **Persistencia**: El contenido se guarda en Supabase
4. **Reutilización**: Lecciones existentes se reutilizan automáticamente

### Contenido Generado

#### Vocabulario
- Palabras relevantes al tema y nivel
- Pronunciación fonética
- Traducción al español
- Definiciones en inglés
- Ejemplos de uso en contexto
- Clasificación por parte del discurso

#### Gramática
- Conceptos apropiados para el nivel
- Explicaciones claras
- Reglas gramaticales
- Ejemplos prácticos
- Errores comunes a evitar
- Consejos útiles

#### Ejercicios
- Preguntas de opción múltiple
- Diferentes tipos (vocabulario, gramática, comprensión)
- Explicaciones detalladas
- Retroalimentación inmediata

## 🎨 Componentes UI

### SelectionSaver
- **Funcionalidad**: Guarda selección y genera lección automáticamente
- **Estados**: Guardando, Generando lección, Error
- **UX**: Indicadores visuales y mensajes informativos

### LessonViewer
- **Navegación por pestañas**: Vocabulario, Gramática, Ejercicios
- **Diseño responsivo**: Optimizado para móvil y desktop
- **Interactividad**: Ejercicios con retroalimentación inmediata
- **Estados de carga**: Spinners y mensajes de estado

## 🔄 Flujo de Usuario

1. **Autenticación**: Usuario inicia sesión
2. **Selección**: Elige nivel y tema en Dashboard
3. **Generación**: Sistema verifica si existe lección o genera nueva
4. **Visualización**: Contenido se muestra en LessonViewer
5. **Interacción**: Usuario practica con ejercicios

## 🛡️ Seguridad y Validación

### Validación de Datos
- **Zod Schemas**: Validación estricta de respuestas de Gemini
- **Sanitización**: Limpieza de contenido generado
- **Tipos TypeScript**: Tipado fuerte en toda la aplicación

### Seguridad
- **RLS Policies**: Políticas de seguridad a nivel de fila en Supabase
- **Autenticación**: Verificación de usuario en todos los endpoints
- **Rate Limiting**: Reintentos controlados en llamadas a API

## 🚨 Manejo de Errores

### Estrategias Implementadas
1. **Reintentos**: Hasta 3 intentos con delay exponencial
2. **Fallbacks**: Mensajes informativos en caso de fallo
3. **Logging**: Registro detallado de errores
4. **UX Graceful**: La aplicación continúa funcionando aunque falle la generación

### Tipos de Error
- **API Errors**: Problemas con Gemini AI
- **Validation Errors**: Respuestas malformadas
- **Database Errors**: Problemas de persistencia
- **Network Errors**: Conectividad

## 📊 Métricas y Monitoreo

### Logs Disponibles
- Tiempo de generación de lecciones
- Errores de API y validación
- Uso por nivel y tema
- Rendimiento de componentes

## 🔮 Próximas Mejoras

### Funcionalidades Planificadas
1. **Regeneración Selectiva**: Regenerar solo vocabulario, gramática o ejercicios
2. **Personalización**: Ajustar dificultad y estilo de contenido
3. **Progreso**: Tracking de progreso del usuario
4. **Favoritos**: Marcar contenido como favorito
5. **Exportación**: Exportar lecciones a PDF

### Optimizaciones Técnicas
1. **Caching**: Cache de lecciones frecuentes
2. **Streaming**: Generación en tiempo real
3. **Batch Processing**: Generación en lotes
4. **Analytics**: Métricas detalladas de uso

## 🧪 Testing

### Estrategia de Pruebas
- **Unit Tests**: Casos de uso y adaptadores
- **Integration Tests**: Flujo completo de generación
- **E2E Tests**: Experiencia de usuario completa
- **API Tests**: Validación de respuestas de Gemini

## 📚 Recursos Adicionales

- [Documentación de Gemini AI](https://ai.google.dev/docs)
- [Guía de Supabase](https://supabase.com/docs)
- [Arquitectura del Proyecto](./GEMINI_INTEGRATION_GUIDE.md)

## 🤝 Contribución

Para contribuir a esta funcionalidad:
1. Revisa la arquitectura en `GEMINI_INTEGRATION_GUIDE.md`
2. Sigue los patrones establecidos en casos de uso
3. Añade tests para nuevas funcionalidades
4. Actualiza documentación según sea necesario

---

**Nota**: Esta integración está diseñada para ser escalable y mantenible, siguiendo principios de Clean Architecture y mejores prácticas de desarrollo.