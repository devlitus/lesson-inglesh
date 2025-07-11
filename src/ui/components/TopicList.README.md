# TopicList Component

Componente React que muestra una lista de topics disponibles para el aprendizaje de inglés.

## Características

- ✅ **Carga automática**: Utiliza `useTopicsAutoLoad` para cargar datos automáticamente
- 🎨 **Design System**: Integrado con el design system del proyecto
- 📱 **Responsive**: Grid adaptativo que funciona en móviles y desktop
- 🔄 **Estados**: Maneja loading, error y estados vacíos
- 🎯 **Selección**: Soporte para selección de topics con indicadores visuales
- 🎨 **Personalización**: Soporte para color schemes e iconos

## Uso Básico

```tsx
import { TopicList } from '../components/TopicList';

function MyPage() {
  const handleTopicSelect = (topic) => {
    console.log('Topic seleccionado:', topic);
  };

  return (
    <TopicList 
      onTopicSelect={handleTopicSelect}
      selectedTopicId="topic-123"
    />
  );
}
```

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `onTopicSelect` | `(topic: Topic) => void` | No | Callback cuando se selecciona un topic |
| `selectedTopicId` | `string` | No | ID del topic actualmente seleccionado |
| `className` | `string` | No | Clases CSS adicionales |

## Estados del Componente

### Loading
Muestra un spinner y mensaje "Cargando topics..."

### Error
Muestra un mensaje de error con estilo visual distintivo

### Vacío
Muestra un estado vacío con icono y mensaje cuando no hay topics

### Con Datos
Muestra una grid responsive de cards con los topics

## Estructura de Topic

```typescript
interface Topic {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color_scheme?: string;
}
```

## Características Visuales

- **Cards elevadas**: Utilizan el componente `Card` del design system
- **Hover effects**: Transiciones suaves al pasar el mouse
- **Selección visual**: Ring azul y badge "SELECCIONADO"
- **Color schemes**: Borde inferior con el color del topic
- **Iconos**: Soporte para emojis o iconos como texto

## Responsive Design

- **Mobile**: 1 columna
- **Tablet**: Auto-fill con mínimo 280px
- **Desktop**: Auto-fill con mínimo 320px

## Integración con Store

El componente utiliza:
- `useTopicsAutoLoad`: Hook que carga automáticamente los topics
- `selectTopic`: Acción para actualizar el topic seleccionado en el store global

## Ejemplo Completo

```tsx
import React, { useState } from 'react';
import { TopicList } from '../components/TopicList';
import type { Topic } from '../../domain/entities/Topic';

function TopicsPage() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    // Navegar a la siguiente página o realizar otra acción
  };

  return (
    <div>
      <h1>Selecciona un Topic</h1>
      <TopicList
        onTopicSelect={handleTopicSelect}
        selectedTopicId={selectedTopic?.id}
        className="my-custom-class"
      />
      
      {selectedTopic && (
        <div>
          <h2>Topic Seleccionado: {selectedTopic.title}</h2>
          <p>{selectedTopic.description}</p>
        </div>
      )}
    </div>
  );
}
```

## Dependencias

- `useTopicsAutoLoad` hook
- Design system components: `Card`, `Badge`
- Tailwind CSS para estilos
- Domain entity: `Topic`

## Notas de Desarrollo

- El componente inyecta estilos CSS automáticamente
- Utiliza Tailwind CSS para la mayoría de estilos
- Sigue el patrón de otros componentes como `LevelsList`
- Maneja errores de forma elegante
- Optimizado para performance con keys apropiadas