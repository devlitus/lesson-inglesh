# 🔧 Solución de Problemas de Autenticación con Supabase

## 🚨 Error: "No API key found in request" (400 Bad Request)

### 📋 Descripción del Problema

Este error ocurre cuando las peticiones a la API de Supabase no incluyen correctamente la autenticación del usuario. Aunque las variables de entorno estén configuradas correctamente, la sesión del usuario puede no estar activa en el momento de hacer la petición.

### 🔍 Síntomas

- Error 400 (Bad Request) en peticiones a tablas de Supabase
- Mensaje: `{"message":"No API key found in request","hint":"No \`apikey\` request header or url param was found."}`
- El error aparece especialmente al refrescar la página o después del login

### 🛠️ Soluciones Implementadas

#### 1. Verificación de Sesión en Adaptadores

**Archivo:** `src/infrastructure/adapters/SupabaseSelectLevelTopicAdapter.ts`

```typescript
// Verificar que hay una sesión activa antes de hacer la petición
const { data: { session }, error: sessionError } = await supabase.auth.getSession();

if (sessionError) {
  throw new Error(`Error de sesión: ${sessionError.message}`);
}

if (!session) {
  throw new Error('No hay sesión activa. El usuario debe autenticarse.');
}
```

#### 2. Logs de Debug

**Archivos modificados:**
- `src/application/use-cases/checkUserSelection.ts`
- `src/infrastructure/adapters/SupabaseSelectLevelTopicAdapter.ts`

Se agregaron logs para rastrear:
- Estado del usuario en el store
- Estado de la sesión de Supabase
- Errores específicos en las peticiones

#### 3. Inicialización Mejorada en AppRouter

**Archivo:** `src/application/navigation/AppRouter.tsx`

- Se asegura que `initializeAuthUseCase` complete antes de verificar selecciones
- Se añadió estado `isInitialized` para controlar el flujo
- Mejor manejo de estados de carga
- **NUEVO**: Agregado delay de 200ms antes de verificar selección del usuario
- **NUEVO**: Función async/await para mejor manejo del timing de la sesión

#### 4. Solución de Timing de JWT
- **PROBLEMA IDENTIFICADO**: El error 400 "No API key found in request" ocurre porque el JWT de Supabase no está disponible inmediatamente después de que `isAuthenticated` se vuelve `true`
- **SOLUCIÓN**: Implementados delays estratégicos en AppRouter (200ms) y en el adaptador (100ms) para permitir que la sesión de Supabase se establezca completamente
- **RESULTADO**: Esto permite que el JWT esté disponible cuando se realizan las consultas a la base de datos con RLS habilitado

### 5. Corrección de Esquema de Base de Datos
- **PROBLEMA IDENTIFICADO**: Error "column select_level_topic.created_at does not exist" en consultas
- **CAUSA**: Las consultas intentaban ordenar por una columna 'created_at' que no existe en la tabla
- **SOLUCIÓN**: Removidas las referencias a 'created_at' en `SupabaseSelectLevelTopicAdapter.ts`
  - Eliminado `.order('created_at', { ascending: false })` en `getLastSelection()`
  - Eliminado `.order('created_at', { ascending: false })` en `getUserSelections()`
- **ESQUEMA ACTUAL**: La tabla `select_level_topic` contiene solo: `id`, `id_user`, `id_level`, `id_topic` (todos tipo UUID)

### 🔧 Pasos para Diagnosticar

1. **Verificar Variables de Entorno:**
   ```bash
   # Verificar que existan en .env
   VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
   VITE_SUPABASE_ANON_KEY="tu-clave-anon"
   ```

2. **Verificar Consola del Navegador:**
   - Buscar logs de "Sesión activa encontrada"
   - Verificar errores de autenticación
   - Revisar el estado del usuario

3. **Verificar Estado de Supabase:**
   ```javascript
   // En la consola del navegador
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Sesión actual:', session);
   ```

### 🚀 Mejores Prácticas

#### 1. Siempre Verificar Sesión

```typescript
// Antes de hacer peticiones a tablas protegidas
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  throw new Error('Usuario no autenticado');
}
```

#### 2. Manejo de Errores Robusto

```typescript
try {
  const result = await supabaseOperation();
  return result;
} catch (error) {
  if (error.message?.includes('Auth session missing')) {
    // Redirigir a login o refrescar sesión
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
  throw error;
}
```

#### 3. Logs de Debug en Desarrollo

```typescript
if (import.meta.env.DEV) {
  console.log('Estado de autenticación:', { user, session });
}
```

### 🔄 Flujo de Autenticación Recomendado

1. **Inicialización:**
   - `initializeAuthUseCase()` obtiene la sesión actual
   - Actualiza el `userStore` con los datos del usuario
   - Configura listeners para cambios de autenticación

2. **Verificación antes de Peticiones:**
   - Verificar que `user` existe en el store
   - Verificar que `session` está activa en Supabase
   - Solo entonces hacer peticiones a la API

3. **Manejo de Errores:**
   - Capturar errores de sesión
   - Limpiar estado local si la sesión es inválida
   - Redirigir a login si es necesario

### 📝 Notas Importantes

- Las peticiones a Supabase requieren una sesión activa para tablas con RLS (Row Level Security)
- El token de sesión se incluye automáticamente en las peticiones cuando hay una sesión válida
- La sesión puede expirar y necesita ser renovada
- Siempre manejar el caso donde no hay sesión activa

### 🆘 Si el Problema Persiste

1. Verificar configuración de RLS en Supabase
2. Revisar políticas de seguridad de las tablas
3. Verificar que el usuario tenga permisos para acceder a los datos
4. Considerar usar `service_role` key para operaciones administrativas (solo en backend)