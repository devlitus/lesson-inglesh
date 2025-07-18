# Casos de Uso: Verificación de Selección del Usuario

## Descripción

Estos casos de uso permiten verificar si un usuario autenticado ya tiene una selección de nivel y tema guardada en la base de datos. Si el usuario ya tiene una selección, la aplicación puede redirigirlo automáticamente a la página de lecciones.

## Casos de Uso Disponibles

### `checkUserSelectionUseCase`

**Propósito**: Verificar si el usuario tiene una selección y obtener los detalles de la misma.

**Parámetros**: Ninguno (obtiene el usuario del store)

**Retorna**:
```typescript
{
  hasSelection: boolean;
  selection: SelectLevelTopic | null;
}
```

**Errores**:
- `Error`: Si no hay usuario autenticado
- `Error`: Si falla la consulta a la base de datos

**Ejemplo de uso**:
```typescript
import { checkUserSelectionUseCase } from '../use-cases';

try {
  const result = await checkUserSelectionUseCase();
  
  if (result.hasSelection) {
    console.log('Usuario tiene selección:', result.selection);
    // Redirigir a página de lecciones
  } else {
    console.log('Usuario no tiene selección');
    // Mostrar dashboard para seleccionar
  }
} catch (error) {
  console.error('Error:', error.message);
}
```

### `hasUserSelectionUseCase`

**Propósito**: Verificar simplemente si el usuario tiene una selección (versión simplificada).

**Parámetros**: Ninguno

**Retorna**: `Promise<boolean>`

**Comportamiento**:
- Retorna `true` si el usuario tiene una selección
- Retorna `false` si no tiene selección o si ocurre un error
- No lanza errores (manejo interno para no bloquear navegación)

**Ejemplo de uso**:
```typescript
import { hasUserSelectionUseCase } from '../use-cases';

const hasSelection = await hasUserSelectionUseCase();

if (hasSelection) {
  // Redirigir a lecciones
  navigate('/lesson');
} else {
  // Mostrar dashboard
  navigate('/dashboard');
}
```

## Integración con AppRouter

El `AppRouter` utiliza estos casos de uso para implementar redirección automática:

1. **Al autenticarse**: Si el usuario ya tiene una selección, se redirige automáticamente a `/lesson`
2. **En el dashboard**: Si el usuario accede al dashboard pero ya tiene una selección, se redirige a `/lesson`
3. **Rutas por defecto**: Las rutas 404 y la ruta raíz consideran la selección del usuario

## Flujo de Navegación

```
Usuario se autentica
       ↓
¿Tiene selección?
       ↓
   Sí → /lesson
       ↓
   No → /dashboard
```

## Dependencias

- `SupabaseSelectLevelTopicAdapter.getLastSelection()`: Para obtener la última selección
- `useUserStore`: Para obtener el usuario autenticado
- `SelectLevelTopic`: Entidad de dominio

## Consideraciones

1. **Manejo de errores**: `hasUserSelectionUseCase` no lanza errores para evitar bloquear la navegación
2. **Performance**: Se ejecuta solo cuando el usuario está autenticado
3. **Estado de carga**: El AppRouter muestra un spinner mientras verifica la selección
4. **Actualización automática**: Se re-ejecuta cuando cambia el estado de autenticación

## Archivos Relacionados

- `src/application/use-cases/checkUserSelection.ts`: Implementación de los casos de uso
- `src/application/navigation/AppRouter.tsx`: Integración con el sistema de navegación
- `src/infrastructure/adapters/SupabaseSelectLevelTopicAdapter.ts`: Adaptador de base de datos
- `src/domain/entities/SelectLevelTopic.ts`: Entidad de dominio