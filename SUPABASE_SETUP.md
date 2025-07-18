# 🔐 Configuración de Supabase para Lesson Inglesh

## 📋 Requisitos Previos

1. Cuenta en [Supabase](https://supabase.com)
2. Proyecto creado en Supabase

## ⚙️ Configuración Inicial

### 1. Obtener Credenciales de Supabase

1. Ve a tu [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia los siguientes valores:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon/public key** (VITE_SUPABASE_ANON_KEY)

### 2. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales reales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
   ```

### 3. Configurar Base de Datos

**IMPORTANTE**: Este proyecto usa un sistema de autenticación personalizado con la tabla `public.users` en lugar del sistema de autenticación nativo de Supabase.

1. En tu Dashboard de Supabase, ve a **SQL Editor**
2. Ejecuta el script de migración ubicado en `docs/database-migration.sql`
3. Esto creará las tablas necesarias:
   - `public.users` (con campo password)
   - `public.user_sessions` (para manejar sesiones)

### 4. Verificar la Configuración de la Base de Datos

1. Ve a **Table Editor** en tu Dashboard de Supabase
2. Verifica que existan las siguientes tablas:
   - `users` con campos: id, email, password, name, created_at, updated_at
   - `user_sessions` con campos: id, user_id, token, expires_at, created_at

## 🔧 Solución de Problemas Comunes

### Error: "Invalid API key"
- Verifica que `VITE_SUPABASE_ANON_KEY` esté correctamente configurada
- Asegúrate de que no haya espacios extra en la clave

### Error: "Failed to fetch"
- Verifica que `VITE_SUPABASE_URL` esté correctamente configurada
- Comprueba tu conexión a internet
- Verifica que el proyecto de Supabase esté activo

### Error: "Table 'users' doesn't exist"
- Asegúrate de haber ejecutado el script de migración `docs/database-migration.sql`
- Verifica que las tablas `users` y `user_sessions` existan en el **Table Editor**

### Error: "Column 'password' doesn't exist"
- La tabla `users` debe tener el campo `password`
- Re-ejecuta el script de migración si es necesario

### Error de Autenticación: "Invalid credentials"
- Verifica que el email y password sean correctos
- Asegúrate de que el usuario esté registrado en la tabla `public.users`
- Revisa que el password esté correctamente hasheado

### Error: "Session expired"
- El token de sesión ha expirado (24 horas por defecto)
- El usuario debe iniciar sesión nuevamente
- Verifica que la tabla `user_sessions` esté funcionando correctamente

### Variables de Entorno No Se Cargan
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo después de cambiar las variables
- Verifica que las variables empiecen con `VITE_`

## 🔍 Debugging del Sistema de Autenticación

### Verificar Estado de las Tablas
```sql
-- Verificar usuarios registrados
SELECT id, email, name, created_at FROM public.users;

-- Verificar sesiones activas
SELECT 
  s.id, 
  s.user_id, 
  u.email, 
  s.expires_at,
  s.created_at
FROM public.user_sessions s
JOIN public.users u ON s.user_id = u.id;
```

### Limpiar Sesiones Expiradas
```sql
-- Eliminar sesiones expiradas
DELETE FROM public.user_sessions 
WHERE expires_at < NOW();
```

## 🚀 Verificación de la Configuración

1. Inicia el servidor: `npm run dev`
2. Abre la consola del navegador (F12)
3. Busca estos mensajes:
   - ✅ `Usuario autenticado encontrado: email@ejemplo.com` (si hay sesión)
   - ℹ️ `No hay usuario autenticado actualmente` (si no hay sesión)
   - ❌ Si ves errores, revisa la configuración

## 📚 Recursos Adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Guía de configuración de Vite con variables de entorno](https://vitejs.dev/guide/env-and-mode.html)
- [Troubleshooting de Supabase](https://supabase.com/docs/guides/auth/troubleshooting)

## 🆘 Soporte

Si sigues teniendo problemas:
1. Verifica que todas las variables de entorno estén configuradas
2. Revisa la consola del navegador para errores específicos
3. Consulta los logs del servidor de desarrollo
4. Verifica la configuración en el Dashboard de Supabase