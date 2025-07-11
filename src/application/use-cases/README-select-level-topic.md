# Casos de Uso para Selección de Level y Topic

Este documento explica cómo usar los casos de uso para guardar y manejar las selecciones de level y topic del usuario.

## Casos de Uso Disponibles

### 1. `saveSelectLevelTopicUseCase(level, topic)`

Guarda la selección de level y topic del usuario en la base de datos.

```typescript
import { saveSelectLevelTopicUseCase } from '../use-cases/saveSelectLevelTopic';
import type { Level } from '../../domain/entities/Level';
import type { Topic } from '../../domain/entities/Topic';

const handleSaveSelection = async (selectedLevel: Level, selectedTopic: Topic) => {
  try {
    const savedSelection = await saveSelectLevelTopicUseCase(selectedLevel, selectedTopic);
    console.log('Selección guardada:', savedSelection);
  } catch (error) {
    console.error('Error al guardar:', error.message);
  }
};
```

**Parámetros:**
- `level: Level` - El level seleccionado por el usuario
- `topic: Topic` - El topic seleccionado por el usuario

**Retorna:**
- `Promise<SelectLevelTopic>` - La selección guardada con ID y timestamps

**Errores:**
- Lanza error si el usuario no está autenticado
- Lanza error si los parámetros level o topic son inválidos
- Lanza error si falla la operación en Supabase

### 2. `getLastSelectLevelTopicUseCase()`

Obtiene la última selección realizada por el usuario.

```typescript
import { getLastSelectLevelTopicUseCase } from '../use-cases/saveSelectLevelTopic';

const loadLastSelection = async () => {
  try {
    const lastSelection = await getLastSelectLevelTopicUseCase();
    if (lastSelection) {
      console.log('Última selección:', lastSelection);
    } else {
      console.log('No hay selecciones previas');
    }
  } catch (error) {
    console.error('Error al obtener última selección:', error.message);
  }
};
```

**Retorna:**
- `Promise<SelectLevelTopic | null>` - La última selección o null si no existe

### 3. `getUserSelectLevelTopicUseCase()`

Obtiene todas las selecciones realizadas por el usuario.

```typescript
import { getUserSelectLevelTopicUseCase } from '../use-cases/saveSelectLevelTopic';

const loadUserSelections = async () => {
  try {
    const selections = await getUserSelectLevelTopicUseCase();
    console.log('Todas las selecciones:', selections);
  } catch (error) {
    console.error('Error al obtener selecciones:', error.message);
  }
};
```

**Retorna:**
- `Promise<SelectLevelTopic[]>` - Lista de todas las selecciones del usuario

## Hook Personalizado: `useSelectLevelTopic`

Para facilitar el uso en componentes React, se proporciona un hook personalizado:

```typescript
import { useSelectLevelTopic } from '../hooks/useSelectLevelTopic';

function MyComponent() {
  const {
    isLoading,
    error,
    lastSelection,
    userSelections,
    saveSelection,
    loadLastSelection,
    loadUserSelections,
    clearError,
    hasSelection,
    getSelectionByLevelAndTopic
  } = useSelectLevelTopic();

  const handleSave = async (level: Level, topic: Topic) => {
    const result = await saveSelection(level, topic);
    if (result) {
      console.log('Guardado exitoso');
    }
  };

  // Verificar si ya existe una selección
  const alreadySelected = hasSelection(levelId, topicId);

  return (
    <div>
      {isLoading && <p>Guardando...</p>}
      {error && <p>Error: {error}</p>}
      {/* Tu UI aquí */}
    </div>
  );
}
```

## Estructura de Datos

### SelectLevelTopic

```typescript
export interface SelectLevelTopic {
  id?: string;                // ID único de la selección
  id_user: string;           // ID del usuario
  id_level: string;          // ID del level seleccionado
  id_topic: string;          // ID del topic seleccionado
  created_at?: string;       // Timestamp de creación
  updated_at?: string;       // Timestamp de última actualización
}
```

### CreateSelectLevelTopicInput

```typescript
export interface CreateSelectLevelTopicInput {
  id_user: string;           // ID del usuario (requerido)
  id_level: string;          // ID del level (requerido)
  id_topic: string;          // ID del topic (requerido)
}
```

## Tabla de Supabase

La funcionalidad requiere una tabla `select_level_topic` en Supabase con la siguiente estructura:

```sql
CREATE TABLE select_level_topic (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_level UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  id_topic UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_select_level_topic_user ON select_level_topic(id_user);
CREATE INDEX idx_select_level_topic_created_at ON select_level_topic(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_select_level_topic_updated_at
    BEFORE UPDATE ON select_level_topic
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Arquitectura

La implementación sigue la arquitectura hexagonal del proyecto:

- **Entidad**: `src/domain/entities/SelectLevelTopic.ts`
- **Adaptador**: `src/infrastructure/adapters/SupabaseSelectLevelTopicAdapter.ts`
- **Casos de Uso**: `src/application/use-cases/saveSelectLevelTopic.ts`
- **Hook**: `src/application/hooks/useSelectLevelTopic.ts`

## Manejo de Errores

Todos los casos de uso incluyen manejo de errores apropiado:

- Validación de autenticación del usuario
- Validación de parámetros de entrada
- Manejo de errores de Supabase
- Mensajes de error descriptivos
- Propagación controlada de errores

## Ejemplo de Uso Completo

```typescript
import React from 'react';
import { useSelectLevelTopic } from '../hooks/useSelectLevelTopic';
import { useLevels } from '../hooks/useLevels';
import { useTopics } from '../hooks/useTopics';

function LevelTopicSelector() {
  const { levels, selectedLevel, selectLevel } = useLevels();
  const { topics, currentTopic, selectTopic } = useTopics();
  const { saveSelection, isLoading, error } = useSelectLevelTopic();

  const handleSaveSelection = async () => {
    if (selectedLevel && currentTopic) {
      const result = await saveSelection(selectedLevel, currentTopic);
      if (result) {
        alert('Selección guardada exitosamente!');
      }
    }
  };

  return (
    <div>
      {/* Selector de levels */}
      <div>
        <h3>Selecciona un Level:</h3>
        {levels.map(level => (
          <button 
            key={level.id} 
            onClick={() => selectLevel(level)}
            className={selectedLevel?.id === level.id ? 'selected' : ''}
          >
            {level.title}
          </button>
        ))}
      </div>

      {/* Selector de topics */}
      <div>
        <h3>Selecciona un Topic:</h3>
        {topics.map(topic => (
          <button 
            key={topic.id} 
            onClick={() => selectTopic(topic)}
            className={currentTopic?.id === topic.id ? 'selected' : ''}
          >
            {topic.title}
          </button>
        ))}
      </div>

      {/* Botón para guardar */}
      <button 
        onClick={handleSaveSelection}
        disabled={!selectedLevel || !currentTopic || isLoading}
      >
        {isLoading ? 'Guardando...' : 'Guardar Selección'}
      </button>

      {error && <p style={{color: 'red'}}>Error: {error}</p>}
    </div>
  );
}

export default LevelTopicSelector;
```

## Próximos Pasos

Puedes extender esta funcionalidad agregando:

- Validación de reglas de negocio (ej: ciertos topics solo disponibles para ciertos levels)
- Historial de selecciones con paginación
- Notificaciones en tiempo real cuando se guarda una selección
- Análisis de patrones de selección del usuario
- Recomendaciones basadas en selecciones previas
- Sincronización offline con almacenamiento local