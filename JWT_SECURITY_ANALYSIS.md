# 🚨 Análisis de Seguridad: Almacenamiento de Tokens JWT en localStorage

## 📋 Resumen Ejecutivo

Este documento analiza los riesgos de seguridad asociados con el almacenamiento de tokens JWT de Supabase en `localStorage` y proporciona recomendaciones específicas para mitigar estas vulnerabilidades.

## ⚠️ Riesgos Críticos Identificados

### 1. 🎯 Exposición de Access Token JWT

**Nivel de Riesgo:** 🔴 **ALTO**

- **Descripción**: El `access_token` contiene información sensible del usuario:
  - ID de usuario: `efc14891-21be-427b-a1f5-7306ec85723a`
  - Email: `carles@test.com`
  - Roles y permisos: `authenticated`
  - Metadatos de sesión

- **Vulnerabilidad**: Accesible desde cualquier script JavaScript en el dominio
- **Vector de Ataque**: Cross-Site Scripting (XSS)
- **Impacto**: Suplantación de identidad, acceso no autorizado a datos

### 2. 🔑 Refresh Token en Texto Plano

**Nivel de Riesgo:** 🔴 **CRÍTICO**

- **Token Actual**: `qa3gcqmekb2j`
- **Duración**: Típicamente válido por semanas/meses (vs 1 hora del access token)
- **Capacidad**: Permite generar nuevos access tokens indefinidamente
- **Consecuencia**: Acceso persistente incluso después de que expire el access token

### 3. 📊 Información Personal Expuesta

**Nivel de Riesgo:** 🟡 **MEDIO**

- **Datos Sensibles Expuestos**:
  ```json
  {
    "email": "carles@test.com",
    "id": "efc14891-21be-427b-a1f5-7306ec85723a",
    "created_at": "2025-07-05T13:42:53.494842Z",
    "last_sign_in_at": "2025-07-11T19:32:56.650209446Z"
  }
  ```
- **Cumplimiento**: Posible violación de GDPR/LGPD por almacenamiento inseguro
- **Privacidad**: Exposición de patrones de uso y metadatos

## 🛡️ Medidas de Seguridad Recomendadas

### 🚨 Acciones Inmediatas (Críticas)

#### 1. Migrar a httpOnly Cookies

**Prioridad:** 🔴 **URGENTE**

```javascript
// Configuración segura de Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: {
      getItem: (key) => {
        return getCookie(key)
      },
      setItem: (key, value) => {
        setCookie(key, value, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 3600 // 1 hora
        })
      },
      removeItem: (key) => {
        deleteCookie(key)
      }
    },
    autoRefreshToken: true,
    persistSession: true
  }
})
```

#### 2. Implementar Content Security Policy (CSP)

**Archivo:** `index.html`

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.supabase.co; 
               object-src 'none'; 
               base-uri 'self';">
```

#### 3. Headers de Seguridad Adicionales

**Configuración en Vite:**

```javascript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  }
})
```

### 🔧 Medidas Adicionales

#### 4. Validación de Tokens en Servidor

```javascript
// Middleware de validación
const validateToken = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error) throw error
    
    // Verificar en blacklist
    const isBlacklisted = await checkTokenBlacklist(token)
    if (isBlacklisted) throw new Error('Token revocado')
    
    return data.user
  } catch (error) {
    throw new Error('Token inválido')
  }
}
```

#### 5. Rotación Automática de Tokens

```javascript
// Configuración de rotación
const setupTokenRotation = () => {
  setInterval(async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('Error al rotar token:', error)
      // Redirigir a login
      window.location.href = '/login'
    }
  }, 15 * 60 * 1000) // Cada 15 minutos
}
```

#### 6. Monitoreo de Seguridad

```javascript
// Sistema de alertas
const securityMonitor = {
  logAccess: (userId, action) => {
    console.log(`[SECURITY] User ${userId} performed ${action} at ${new Date().toISOString()}`)
  },
  
  detectMultipleSessions: async (userId) => {
    const activeSessions = await getActiveSessionsCount(userId)
    if (activeSessions > 3) {
      await sendSecurityAlert(userId, 'Multiple sessions detected')
    }
  },
  
  checkSuspiciousActivity: (userId, ipAddress) => {
    // Implementar lógica de detección
  }
}
```

## 📋 Plan de Acción Prioritario

### Fase 1: Mitigación Inmediata (1-2 días)
- [ ] Implementar httpOnly cookies para tokens
- [ ] Configurar CSP y headers de seguridad
- [ ] Auditar código existente para referencias a localStorage

### Fase 2: Fortalecimiento (1 semana)
- [ ] Implementar rotación automática de tokens
- [ ] Configurar validación de tokens en servidor
- [ ] Establecer sistema de blacklist de tokens

### Fase 3: Monitoreo (2 semanas)
- [ ] Implementar logging de seguridad
- [ ] Configurar alertas automáticas
- [ ] Realizar pruebas de penetración

### Fase 4: Mantenimiento (Continuo)
- [ ] Auditorías de seguridad regulares
- [ ] Actualizaciones de dependencias
- [ ] Revisión de logs de seguridad

## 🔍 Verificación de Implementación

### Checklist de Seguridad

- [ ] **No hay tokens en localStorage/sessionStorage**
  ```javascript
  // Verificar en DevTools Console
  console.log('localStorage:', localStorage)
  console.log('sessionStorage:', sessionStorage)
  ```

- [ ] **Headers de seguridad configurados**
  - Usar [SecurityHeaders.com](https://securityheaders.com) para auditar
  - Verificar CSP con [CSP Evaluator](https://csp-evaluator.withgoogle.com)

- [ ] **Tokens en cookies httpOnly**
  ```javascript
  // Verificar en DevTools > Application > Cookies
  // Debe mostrar HttpOnly: ✓
  ```

- [ ] **Rotación de tokens funcional**
  ```javascript
  // Monitorear en Network tab
  // Debe ver requests de refresh cada 15 minutos
  ```

### Herramientas de Testing

1. **OWASP ZAP** - Pruebas automatizadas de seguridad
2. **Burp Suite** - Análisis de tráfico y vulnerabilidades
3. **npm audit** - Auditoría de dependencias
4. **Snyk** - Monitoreo continuo de vulnerabilidades

## 📊 Métricas de Seguridad

### KPIs a Monitorear

- **Tiempo de vida promedio de tokens**: < 1 hora
- **Intentos de acceso no autorizado**: 0 por día
- **Tokens revocados por actividad sospechosa**: Registro y análisis
- **Tiempo de respuesta a incidentes**: < 15 minutos

## 🚨 Procedimiento de Respuesta a Incidentes

### En caso de compromiso de tokens:

1. **Inmediato (0-5 minutos)**
   - Revocar todos los tokens del usuario afectado
   - Invalidar sesiones activas
   - Bloquear IP sospechosa temporalmente

2. **Corto plazo (5-30 minutos)**
   - Notificar al usuario por email
   - Forzar cambio de contraseña
   - Revisar logs de actividad

3. **Mediano plazo (30 minutos - 2 horas)**
   - Análisis forense del incidente
   - Identificar vector de ataque
   - Implementar medidas adicionales

## 📚 Referencias y Recursos

- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [Supabase Auth Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [GDPR Compliance Guidelines](https://gdpr.eu/)

---

**Documento creado:** 2025-01-11  
**Última actualización:** 2025-01-11  
**Próxima revisión:** 2025-02-11  
**Responsable:** Equipo de Seguridad