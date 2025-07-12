# 🧪 Estrategia de Testing para Lesson Inglesh

## 📋 Recomendación de Framework de Testing

### Framework Recomendado: **Vitest + Testing Library**

**¿Por qué Vitest?**
- ✅ **Integración nativa con Vite**: Configuración mínima, misma configuración que el proyecto
- ✅ **Performance superior**: Más rápido que Jest para proyectos Vite
- ✅ **ESM nativo**: Soporte completo para módulos ES6
- ✅ **TypeScript out-of-the-box**: Sin configuración adicional
- ✅ **API compatible con Jest**: Migración fácil si es necesario
- ✅ **Watch mode inteligente**: Recarga solo los tests afectados

### Stack de Testing Completo
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "vitest": "^1.0.0",
  "@vitest/ui": "^1.0.0",
  "jsdom": "^23.0.0",
  "msw": "^2.0.0"
}
```

---

## 🎯 Tests Clasificados por Prioridad y Tipo

### 🔴 **PRIORIDAD 1 - CRÍTICOS**

#### 1. **Autenticación y Seguridad** 🧪 `UNITARIO`
**Archivo**: `src/application/use-cases/__tests__/initializeAuth.test.ts`
**Justificación**: Core de seguridad de la aplicación
```typescript
describe('initializeAuth Use Case', () => {
  test('should initialize user session from Supabase', async () => {
    // Arrange: Mock Supabase session
    // Act: Call initializeAuth
    // Assert: User store updated correctly
  });
  
  test('should handle authentication errors gracefully', async () => {
    // Arrange: Mock Supabase error
    // Act: Call initializeAuth
    // Assert: Error handled, user remains null
  });
});
```

#### 2. **User Store (Zustand)** 🧪 `UNITARIO`
**Archivo**: `src/infrastructure/store/__tests__/userStore.test.ts`
**Justificación**: Estado global crítico para autenticación
```typescript
describe('User Store', () => {
  test('should set user and update authentication state', () => {
    // Arrange: Initial state
    // Act: setUser with valid user
    // Assert: isAuthenticated = true, user set
  });
  
  test('should logout and clear user data', () => {
    // Arrange: Authenticated state
    // Act: logout()
    // Assert: user = null, isAuthenticated = false
  });
});
```

#### 3. **Navegación y Rutas Protegidas** 🔗 `INTEGRACIÓN`
**Archivo**: `src/application/navigation/__tests__/AppRouter.test.tsx`
**Justificación**: Integración entre autenticación y navegación
```typescript
describe('AppRouter', () => {
  test('should redirect unauthenticated users to login', () => {
    // Arrange: No authenticated user
    // Act: Navigate to protected route
    // Assert: Redirected to /login
  });
  
  test('should allow authenticated users to access protected routes', () => {
    // Arrange: Authenticated user
    // Act: Navigate to /dashboard
    // Assert: Dashboard page rendered
  });
});
```

### 🟡 **PRIORIDAD 2 - IMPORTANTES**

#### 4. **Button Component (Design System)** 🧪 `UNITARIO`
**Archivo**: `src/design-system/components/atoms/__tests__/Button.test.tsx`
**Justificación**: Componente base más usado en la UI
```typescript
describe('Button Component', () => {
  test('should render with correct variant styles', () => {
    // Arrange: Different button variants
    // Act: Render buttons
    // Assert: Correct CSS classes applied
  });
  
  test('should handle click events', () => {
    // Arrange: Button with onClick handler
    // Act: User clicks button
    // Assert: Handler called with correct parameters
  });
});
```

#### 5. **Selection Store (Zustand)** 🧪 `UNITARIO`
**Archivo**: `src/infrastructure/store/__tests__/selectionStore.test.ts`
**Justificación**: Estado crítico para funcionalidad de lecciones
```typescript
describe('Selection Store', () => {
  test('should update level selection correctly', () => {
    // Arrange: Initial state
    // Act: updateLevel('beginner')
    // Assert: Level updated, persistence triggered
  });
  
  test('should validate complete selection', () => {
    // Arrange: Partial selection
    // Act: hasCompleteSelection()
    // Assert: Returns false until all fields set
  });
});
```

#### 6. **useNavigation Hook** 🧪 `UNITARIO`
**Archivo**: `src/application/hooks/__tests__/useNavigation.test.ts`
**Justificación**: Hook crítico para navegación programática
```typescript
describe('useNavigation Hook', () => {
  test('should navigate to dashboard correctly', () => {
    // Arrange: Hook setup with router mock
    // Act: Call goToDashboard()
    // Assert: Navigation called with correct route
  });
});
```

#### 7. **Validación de Esquemas (Zod)** 🧪 `UNITARIO`
**Archivo**: `src/domain/schemas/__tests__/userSchema.test.ts`
**Justificación**: Validación de datos críticos
```typescript
describe('User Schema Validation', () => {
  test('should validate correct user data', () => {
    // Arrange: Valid user object
    // Act: Parse with schema
    // Assert: Validation passes
  });
  
  test('should reject invalid email format', () => {
    // Arrange: User with invalid email
    // Act: Parse with schema
    // Assert: Validation fails with email error
  });
});
```

### 🟢 **PRIORIDAD 3 - DESEABLES**

#### 8. **LevelsList Component** 🔗 `INTEGRACIÓN`
**Archivo**: `src/ui/components/__tests__/LevelsList.test.tsx`
**Justificación**: Integración entre store, hooks y UI
```typescript
describe('LevelsList Component', () => {
  test('should display loading state while fetching levels', () => {
    // Arrange: Loading state in store
    // Act: Render component
    // Assert: Loading spinner visible
  });
  
  test('should render levels list when data loaded', () => {
    // Arrange: Levels data in store
    // Act: Render component
    // Assert: All levels displayed
  });
});
```

#### 9. **TopicList Component** 🔗 `INTEGRACIÓN`
**Archivo**: `src/ui/components/__tests__/TopicList.test.tsx`
**Justificación**: Integración compleja con auto-loading
```typescript
describe('TopicList Component', () => {
  test('should auto-load topics when level selected', () => {
    // Arrange: Level selected in store
    // Act: Render component
    // Assert: Topics fetched automatically
  });
});
```

#### 10. **Supabase Adapters** 🔗 `INTEGRACIÓN`
**Archivo**: `src/infrastructure/adapters/__tests__/SupabaseUserAdapter.test.ts`
**Justificación**: Integración con servicios externos
```typescript
describe('Supabase User Adapter', () => {
  test('should fetch user profile successfully', async () => {
    // Arrange: Mock Supabase response
    // Act: Call getUserProfile()
    // Assert: Correct user data returned
  });
  
  test('should handle Supabase connection errors', async () => {
    // Arrange: Mock network error
    // Act: Call getUserProfile()
    // Assert: Error thrown with appropriate message
  });
});
```

#### 11. **Design System Utils** 🧪 `UNITARIO`
**Archivo**: `src/design-system/utils/__tests__/cn.test.ts`
**Justificación**: Utilidades base del sistema de diseño
```typescript
describe('CN Utility Function', () => {
  test('should merge class names correctly', () => {
    // Arrange: Multiple class strings
    // Act: Call cn() with classes
    // Assert: Merged string with no duplicates
  });
});
```

### 🔵 **PRIORIDAD 4 - OPCIONALES**

#### 12. **Dashboard Page** 🔗 `INTEGRACIÓN`
**Archivo**: `src/ui/pages/__tests__/DashboardPage.test.tsx`
**Justificación**: Integración completa de página
```typescript
describe('Dashboard Page', () => {
  test('should render user information correctly', () => {
    // Arrange: Authenticated user in store
    // Act: Render DashboardPage
    // Assert: User name and email displayed
  });
});
```

#### 13. **Login Page** 🔗 `INTEGRACIÓN`
**Archivo**: `src/ui/pages/__tests__/LoginPage.test.tsx`
**Justificación**: Flujo completo de autenticación
```typescript
describe('Login Page', () => {
  test('should handle successful login flow', () => {
    // Arrange: Login form
    // Act: Submit valid credentials
    // Assert: User redirected to dashboard
  });
});
```

#### 14. **Casos de Uso de Negocio** 🧪 `UNITARIO`
**Archivo**: `src/application/use-cases/__tests__/checkUserSelection.test.ts`
**Justificación**: Lógica de negocio específica
```typescript
describe('Check User Selection Use Case', () => {
  test('should return true when user has complete selection', async () => {
    // Arrange: User with level and topic selected
    // Act: Call hasUserSelectionUseCase()
    // Assert: Returns true
  });
});
```

### 🎭 **TESTS E2E (End-to-End)**

#### E2E-1. **Flujo Completo de Autenticación** 🎭 `E2E`
**Archivo**: `e2e/__tests__/auth-flow.spec.ts`
**Justificación**: Flujo crítico de usuario
```typescript
describe('Authentication Flow E2E', () => {
  test('should complete full login to lesson flow', async () => {
    // 1. Visit login page
    // 2. Enter credentials
    // 3. Navigate to dashboard
    // 4. Select level and topic
    // 5. Start lesson
  });
});
```

#### E2E-2. **Flujo de Selección de Lección** 🎭 `E2E`
**Archivo**: `e2e/__tests__/lesson-selection.spec.ts`
**Justificación**: Flujo principal de la aplicación
```typescript
describe('Lesson Selection Flow E2E', () => {
  test('should select level, topic and navigate to lesson', async () => {
    // 1. Login user
    // 2. Select level from list
    // 3. Select topic from auto-loaded list
    // 4. Navigate to lesson page
    // 5. Verify lesson content loads
  });
});
```

---

## 📊 Resumen de Clasificación de Tests

### 📈 **Distribución por Tipo**
| Tipo | Cantidad | Porcentaje | Prioridad Promedio |
|------|----------|------------|--------------------|
| 🧪 **Unitarios** | 8 tests | 50% | Alta |
| 🔗 **Integración** | 6 tests | 37.5% | Media-Alta |
| 🎭 **E2E** | 2 tests | 12.5% | Media |
| **TOTAL** | **16 tests** | **100%** | - |

### 🎯 **Distribución por Prioridad**
| Prioridad | Cantidad | Tests Incluidos |
|-----------|----------|----------------|
| 🔴 **Críticos (P1)** | 3 tests | Auth, UserStore, Navigation |
| 🟡 **Importantes (P2)** | 4 tests | Button, SelectionStore, Hook, Validation |
| 🟢 **Deseables (P3)** | 4 tests | Components, Adapters, Utils |
| 🔵 **Opcionales (P4)** | 3 tests | Pages, Business Logic |
| 🎭 **E2E** | 2 tests | Critical User Flows |

### ⚡ **Orden de Implementación Recomendado**
1. **Semana 1**: Tests Críticos (P1) - 3 tests
2. **Semana 2**: Tests Importantes (P2) - 4 tests  
3. **Semana 3**: Tests Deseables (P3) - 4 tests
4. **Semana 4**: Tests Opcionales (P4) + E2E - 5 tests

### 🎪 **Justificación de Tipos**

#### 🧪 **Tests Unitarios** (8 tests)
- **Propósito**: Verificar funciones/componentes aislados
- **Velocidad**: Muy rápidos (< 100ms cada uno)
- **Cobertura**: Lógica de negocio, utilidades, componentes simples
- **Mocking**: Extensivo (APIs, stores, navegación)

#### 🔗 **Tests de Integración** (6 tests)
- **Propósito**: Verificar interacción entre módulos
- **Velocidad**: Moderados (100-500ms cada uno)
- **Cobertura**: Flujos de datos, comunicación store-component
- **Mocking**: Selectivo (solo APIs externas)

#### 🎭 **Tests E2E** (2 tests)
- **Propósito**: Verificar flujos completos de usuario
- **Velocidad**: Lentos (2-10 segundos cada uno)
- **Cobertura**: Experiencia de usuario real
- **Mocking**: Mínimo (solo servicios externos críticos)

---

## 🛠️ Configuración Recomendada

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### src/test/setup.ts
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  })),
}));
```

---

## 📊 Métricas de Cobertura Objetivo

- **Funciones críticas**: 95%+ cobertura
- **Componentes UI**: 80%+ cobertura
- **Utilidades**: 90%+ cobertura
- **Casos de uso**: 85%+ cobertura
- **Cobertura general**: 80%+

---

## 🚀 Plan de Implementación

### Fase 1: Setup (1-2 días)
1. Instalar dependencias de testing
2. Configurar Vitest
3. Crear setup básico y mocks

### Fase 2: Tests Críticos (3-5 días)
1. Tests de autenticación
2. Tests de stores
3. Tests de navegación

### Fase 3: Tests Importantes (5-7 días)
1. Tests de componentes del design system
2. Tests de hooks
3. Tests de validación

### Fase 4: Tests Complementarios (3-5 días)
1. Tests de componentes UI
2. Tests de adaptadores
3. Tests de utilidades

---

## 🎯 Beneficios Esperados

- ✅ **Confiabilidad**: Detección temprana de bugs
- ✅ **Refactoring seguro**: Cambios sin miedo a romper funcionalidad
- ✅ **Documentación viva**: Tests como especificación del comportamiento
- ✅ **Calidad del código**: Mejor diseño y arquitectura
- ✅ **Productividad**: Menos tiempo debuggeando en producción