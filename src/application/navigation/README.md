# 📍 Sistema de Navegación

Este directorio contiene toda la configuración y lógica de navegación de la aplicación, centralizada y organizada para facilitar el mantenimiento y escalabilidad.

## 📁 Estructura

```
src/application/navigation/
├── AppRouter.tsx     # Componente principal de enrutamiento
├── routes.ts         # Configuración centralizada de rutas
├── index.ts          # Exports del módulo
└── README.md         # Esta documentación
```

## 🔧 Componentes

### AppRouter.tsx
Componente principal que maneja:
- ✅ Inicialización de autenticación
- ✅ Rutas públicas y protegidas
- ✅ Redirecciones automáticas
- ✅ Estados de carga
- ✅ Manejo de rutas 404

### routes.ts
Configuración centralizada que incluye:
- 🔗 Constantes de rutas tipadas
- 🔒 Separación entre rutas públicas y protegidas
- 🛡️ Utilidades de validación de rutas
- 📝 Tipos TypeScript para mayor seguridad

## 🚀 Uso

### Importar el Router Principal
```tsx
import { AppRouter } from './application/navigation';

function App() {
  return <AppRouter />;
}
```

### Usar Constantes de Rutas
```tsx
import { ROUTES } from './application/navigation';

// En lugar de strings hardcodeados
navigate('/dashboard'); // ❌

// Usar constantes tipadas
navigate(ROUTES.DASHBOARD); // ✅
```

### Hook de Navegación
```tsx
import { useNavigation } from '../hooks';

function MyComponent() {
  const { goToDashboard, goToLesson, goBack } = useNavigation();
  
  return (
    <div>
      <button onClick={goToDashboard}>Dashboard</button>
      <button onClick={goToLesson}>Lección</button>
      <button onClick={goBack}>Volver</button>
    </div>
  );
}
```

## 🔒 Rutas Disponibles

### Rutas Públicas
- `/login` - Página de autenticación

### Rutas Protegidas
- `/dashboard` - Panel principal del usuario
- `/lesson` - Página de lecciones

### Rutas Especiales
- `/` - Redirige según estado de autenticación
- `*` - Manejo de 404, redirige según autenticación

## 🛡️ Protección de Rutas

Todas las rutas protegidas utilizan el componente `ProtectedRoute` que:
- Verifica el estado de autenticación
- Redirige a `/login` si no está autenticado
- Permite acceso si está autenticado

## 🔄 Flujo de Navegación

1. **Usuario no autenticado**: Todas las rutas redirigen a `/login`
2. **Usuario autenticado**: Acceso completo a rutas protegidas
3. **Ruta raíz (`/`)**: Redirige automáticamente según autenticación
4. **Rutas inexistentes**: Redirigen según estado de autenticación

## 🎯 Beneficios

- ✅ **Centralización**: Toda la lógica de navegación en un lugar
- ✅ **Type Safety**: Rutas tipadas previenen errores
- ✅ **Mantenibilidad**: Fácil modificación de rutas
- ✅ **Reutilización**: Hook personalizado para navegación
- ✅ **Seguridad**: Protección automática de rutas
- ✅ **Escalabilidad**: Fácil agregar nuevas rutas

## 🔧 Agregar Nueva Ruta

1. **Definir en routes.ts**:
```tsx
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  LESSON: '/lesson',
  NEW_PAGE: '/new-page', // ✅ Nueva ruta
} as const;
```

2. **Agregar al AppRouter.tsx**:
```tsx
<Route 
  path={ROUTES.NEW_PAGE} 
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  } 
/>
```

3. **Agregar función al useNavigation.ts**:
```tsx
const goToNewPage = () => navigate(ROUTES.NEW_PAGE);

return {
  // ... otras funciones
  goToNewPage,
};
```