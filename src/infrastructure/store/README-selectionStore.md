# Selection Store

Store de Zustand para manejar la selección de level y topic del usuario.

## Características

- **Persistencia**: Los datos se guardan automáticamente en localStorage
- **Estado centralizado**: Maneja level, topic y user IDs en un solo lugar
- **Funciones utilitarias**: Incluye helpers para validación y limpieza
- **TypeScript**: Completamente tipado para mejor DX

## Estructura del Estado

```typescript
interface Selection {
  level: string | null; // id_level
  topic: string | null; // id_topic
  user: string | null;  // id_user
}
```

## API del Store

### Hook Principal: `useSelectionStore()`

```typescript
const {
  selection,
  setSelected,
  updateLevel,
  updateTopic,
  updateUser,
  clearSelection,
  hasCompleteSelection,
  getSelection
} = useSelectionStore();
```

### Hook Simplificado: `useSelection()`

```typescript
const {
  // Estado
  selection,
  level,
  topic,
  user,
  
  // Acciones
  setSelected,
  updateLevel,
  updateTopic,
  updateUser,
  clearSelection,
  
  // Getters
  hasCompleteSelection,
  getSelection
} = useSelection();
```

## Funciones Disponibles

### `setSelected({ level, topic, user })`
Establece una selección completa de una vez.

```typescript
setSelected({
  level: 'level-1',
  topic: 'topic-1', 
  user: 'user-123'
});
```

### `updateLevel(level: string)`
Actualiza solo el level seleccionado.

```typescript
updateLevel('level-2');
```

### `updateTopic(topic: string)`
Actualiza solo el topic seleccionado.

```typescript
updateTopic('topic-3');
```

### `updateUser(user: string)`
Actualiza solo el user ID.

```typescript
updateUser('user-456');
```

### `clearSelection()`
Limpia toda la selección, estableciendo todos los valores a `null`.

```typescript
clearSelection();
```

### `hasCompleteSelection()`
Retorna `true` si level, topic y user están todos seleccionados.

```typescript
if (hasCompleteSelection()) {
  // Proceder con la acción
}
```

### `getSelection()`
Retorna el objeto de selección completo.

```typescript
const currentSelection = getSelection();
console.log(currentSelection); // { level: 'level-1', topic: 'topic-1', user: 'user-123' }
```

## Ejemplos de Uso

### Ejemplo Básico

```typescript
import { useSelection } from '../../infrastructure/store/selectionStore';

function MyComponent() {
  const { level, topic, setSelected, clearSelection } = useSelection();
  
  const handleSave = () => {
    setSelected({
      level: 'beginner',
      topic: 'grammar',
      user: 'user-123'
    });
  };
  
  return (
    <div>
      <p>Level: {level}</p>
      <p>Topic: {topic}</p>
      <button onClick={handleSave}>Guardar</button>
      <button onClick={clearSelection}>Limpiar</button>
    </div>
  );
}
```

### Sincronización con Componentes Existentes

```typescript
import { useEffect } from 'react';
import { useSelection } from '../../infrastructure/store/selectionStore';
import { useLevels } from '../../application/hooks/useLevels';
import { useTopics } from '../../application/hooks/useTopics';

function SyncComponent() {
  const { selectedLevel } = useLevels();
  const { currentTopic } = useTopics();
  const { updateLevel, updateTopic } = useSelection();
  
  // Sincronizar cuando cambien las selecciones externas
  useEffect(() => {
    if (selectedLevel?.id) {
      updateLevel(selectedLevel.id);
    }
  }, [selectedLevel?.id, updateLevel]);
  
  useEffect(() => {
    if (currentTopic?.id) {
      updateTopic(currentTopic.id);
    }
  }, [currentTopic?.id, updateTopic]);
  
  return <div>Sincronización automática activa</div>;
}
```

### Validación Antes de Guardar

```typescript
function SaveComponent() {
  const { hasCompleteSelection, getSelection } = useSelection();
  
  const handleSave = async () => {
    if (!hasCompleteSelection()) {
      alert('Selecciona level, topic y asegúrate de estar logueado');
      return;
    }
    
    const selection = getSelection();
    // Proceder con el guardado
    await saveToDatabase(selection);
  };
  
  return (
    <button 
      onClick={handleSave}
      disabled={!hasCompleteSelection()}
    >
      Guardar Selección
    </button>
  );
}
```

## Persistencia

El store utiliza el middleware `persist` de Zustand para guardar automáticamente el estado en localStorage con la clave `selection-storage`.

### Configuración de Persistencia

```typescript
{
  name: 'selection-storage',
  partialize: (state) => ({ selection: state.selection })
}
```

Solo se persiste el objeto `selection`, las funciones no se guardan en localStorage.

## Integración con Componentes Existentes

El store está diseñado para trabajar junto con:

- `LevelsList` - Para mostrar y seleccionar levels
- `TopicList` - Para mostrar y seleccionar topics
- `SelectionSaver` - Para guardar la selección en Supabase
- `SelectionManager` - Para administrar y visualizar el estado

## Beneficios

1. **Estado centralizado**: Una sola fuente de verdad para las selecciones
2. **Persistencia automática**: No se pierden las selecciones al recargar
3. **Flexibilidad**: Permite actualizaciones parciales o completas
4. **Validación**: Helper para verificar selecciones completas
5. **TypeScript**: Tipado completo para mejor experiencia de desarrollo
6. **Performance**: Zustand es ligero y eficiente