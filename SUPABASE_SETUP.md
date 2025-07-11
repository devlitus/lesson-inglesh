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

### 3. Configurar Autenticación en Supabase

1. En tu Dashboard de Supabase, ve a **Authentication** → **Settings**
2. Configura los **Site URL** permitidos:
   - `http://localhost:5173` (desarrollo)
   - `http://localhost:5174` (desarrollo alternativo)
   - Tu dominio de producción

3. Habilita los proveedores de autenticación que necesites:
   - **Email/Password** (recomendado para empezar)
   - Otros proveedores según tus necesidades

## 🔧 Solución de Problemas Comunes

### Error: "Auth session missing!"

**Causa:** Este error ocurre cuando:
- No hay una sesión activa de usuario
- Las credenciales de Supabase no están configuradas
- El token de sesión ha expirado

**Solución:**
1. ✅ Verifica que el archivo `.env` existe y tiene las credenciales correctas
2. ✅ Reinicia el servidor de desarrollo: `npm run dev`
3. ✅ Verifica en la consola del navegador los logs de autenticación
4. ✅ Si persiste, intenta hacer logout y login nuevamente

### Error: "Faltan las variables de entorno de Supabase"

**Causa:** Las variables `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY` no están definidas.

**Solución:**
1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Asegúrate de que las variables empiecen con `VITE_`
3. Reinicia el servidor después de modificar el `.env`

### Error: "Invalid JWT" o "session_not_found"

**Causa:** Token de sesión inválido o expirado.

**Solución:**
1. Limpia el localStorage del navegador
2. Haz logout y login nuevamente
3. Verifica que la configuración de Supabase sea correcta

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