# Casos de Uso para Levels

Este documento explica cómo usar los casos de uso para obtener y manejar los levels de la aplicación.

## Estructura de la Entidad Level

```typescript
export interface Level {
  id: string;
  title: string;
  sub_title: string;
  description: string;
  feature: string;
  icon: string;
  color_scheme: string;
}
```

## Casos de Uso Disponibles

### 1. `getLevelsUseCase()`

Obtiene todos los levels disponibles desde Supabase.

```typescript
import { getLevelsUseCase } from '../use-cases/getLevels';

// Uso básico
try {
  const levels = await getLevelsUseCase();
  console.log('Levels obtenidos:', levels);
} catch (error) {
  console.error('Error al obtener levels:', error.message);
}
```

### 2. `getLevelByIdUseCase(id: string)`

Obtiene un level específico por su ID.

```typescript
import { getLevelByIdUseCase } from '../use-cases/getLevels';

// Uso básico
try {
  const level = await getLevelByIdUseCase('uuid-del-level');
  if (level) {
    console.log('Level encontrado:', level);
  } else {
    console.log('Level no encontrado');
  }
} catch (error) {
  console.error('Error al obtener level:', error.message);
}
```

## Hook Personalizado: `useLevels()`

Para facilitar el uso en componentes React, se proporciona un hook personalizado:

```typescript
import { useLevels } from '../hooks/useLevels';

function MyComponent() {
  const {
    levels,
    selectedLevel,
    isLoading,
    error,
    loadLevels,
    loadLevelById,
    selectLevel,
    clearError
  } = useLevels();

  // Cargar levels al montar el componente
  useEffect(() => {
    loadLevels();
  }, []);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {levels.map(level => (
        <div key={level.id} onClick={() => selectLevel(level)}>
          {level.title}
        </div>
      ))}
    </div>
  );
}
```

## Hook con Carga Automática: `useLevelsAutoLoad()`

Este hook carga automáticamente los levels al montar el componente:

```typescript
import { useLevelsAutoLoad } from '../hooks/useLevels';

function MyComponent() {
  const { levels, isLoading, error } = useLevelsAutoLoad();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {levels.map(level => (
        <div key={level.id}>{level.title}</div>
      ))}
    </div>
  );
}
```

## Componente de Ejemplo: `LevelsList`

Se incluye un componente de ejemplo que muestra cómo usar los levels:

```typescript
import { LevelsList } from '../../ui/components/LevelsList';

function App() {
  const handleLevelSelect = (level) => {
    console.log('Level seleccionado:', level);
  };

  return (
    <LevelsList 
      onLevelSelect={handleLevelSelect}
      className="my-levels-list"
    />
  );
}
```

## Store de Estado: `useLevelStore`

El estado de los levels se maneja con Zustand:

```typescript
import { useLevelStore } from '../../infrastructure/store/levelStore';

function MyComponent() {
  const {
    levels,
    selectedLevel,
    isLoading,
    error,
    setLevels,
    setSelectedLevel,
    setLoading,
    setError,
    clearError
  } = useLevelStore();

  // Usar las funciones del store directamente
}
```

## Arquitectura

La implementación sigue la arquitectura hexagonal del proyecto:

- **Entidad**: `src/domain/entities/Level.ts`
- **Adaptador**: `src/infrastructure/adapters/SupabaseLevelAdapter.ts`
- **Casos de Uso**: `src/application/use-cases/getLevels.ts`
- **Store**: `src/infrastructure/store/levelStore.ts`
- **Hook**: `src/application/hooks/useLevels.ts`
- **Componente**: `src/ui/components/LevelsList.tsx`

## Manejo de Errores

Todos los casos de uso incluyen manejo de errores apropiado:

- Validación de parámetros de entrada
- Manejo de errores de Supabase
- Mensajes de error descriptivos
- Propagación controlada de errores

## Próximos Pasos

Puedes extender esta funcionalidad agregando:

- Casos de uso para crear/actualizar/eliminar levels
- Filtrado y búsqueda de levels
- Paginación para grandes cantidades de levels
- Cache local para mejorar el rendimiento
- Sincronización en tiempo real con Supabase Realtime