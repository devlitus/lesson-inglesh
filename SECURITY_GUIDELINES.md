# 🔒 Guía de Seguridad para Lesson Inglesh

## 📋 Resumen Ejecutivo

Esta guía documenta las vulnerabilidades de seguridad identificadas en el almacenamiento de datos y proporciona recomendaciones específicas para mejorar la seguridad de la aplicación.

## 🚨 Problemas Críticos Identificados

### 1. **Almacenamiento de Tokens Sensibles en localStorage**

**Problema:** Se están almacenando tokens de acceso y refresh tokens en localStorage sin cifrado.

**Riesgo:** Alto - Exposición de credenciales de autenticación

**Datos expuestos:**
- `access_token` (JWT completo)
- `refresh_token` 
- `expires_at` y `expires_in`
- Información completa del usuario

### 2. **Información Personal Identificable (PII) en localStorage**

**Problema:** Datos personales almacenados localmente sin protección.

**Riesgo:** Alto - Violación de privacidad

**Datos expuestos:**
- Email del usuario
- ID único del usuario
- Metadatos de la aplicación
- Timestamps de actividad
- Información de identidades vinculadas

### 3. **Persistencia Excesiva de Datos**

**Problema:** Se persisten más datos de los necesarios en múltiples stores.

**Riesgo:** Medio - Superficie de ataque ampliada

**Stores afectados:**
- `userStore` - Persiste objeto usuario completo
- `selectionStore` - Persiste selecciones del usuario

## 🛡️ Recomendaciones de Seguridad

### **Prioridad 1: Eliminar Datos Sensibles**

#### ❌ **ELIMINAR INMEDIATAMENTE**

```typescript
// NO almacenar:
{
  access_token: "eyJhbGciOiJIUzI1NiIs...",
  refresh_token: "ntzn5rhqrpd3",
  user: {
    email: "carles@test.com",
    id: "efc14891-21be-427b-a1f5-7306ec85723a",
    // ... otros datos sensibles
  },
  app_metadata: { /* metadatos */ },
  user_metadata: { /* metadatos del usuario */ },
  identities: [ /* identidades */ ],
  // ... timestamps y otros datos
}
```

#### ✅ **MANTENER SOLO LO ESENCIAL**

```typescript
// Solo almacenar:
{
  isAuthenticated: boolean,
  // Opcionalmente, solo si es absolutamente necesario:
  userId: string // Sin otros datos personales
}
```

### **Prioridad 2: Modificar userStore**

#### Archivo: `src/infrastructure/store/userStore.ts`

```typescript
// ANTES (INSEGURO)
export const useUserStore = create<UserState>()()
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user, // ❌ ELIMINAR
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// DESPUÉS (SEGURO)
export const useUserStore = create<UserState>()()
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated // ✅ Solo esto
      }),
    }
  )
);
```

### **Prioridad 3: Gestión Segura de Datos del Usuario**

#### Estrategia Recomendada:

1. **Solo persistir estado de autenticación**
2. **Obtener datos del usuario del servidor cuando sea necesario**
3. **Mantener datos sensibles solo en memoria durante la sesión**

```typescript
// Ejemplo de implementación segura
const getUserData = async () => {
  if (!isAuthenticated) return null;
  
  // Obtener datos frescos del servidor
  const user = await SupabaseAuthAdapter.getCurrentUser();
  return user;
};
```

### **Prioridad 4: Limpieza de Datos Existentes**

#### Implementar limpieza automática:

```typescript
// En logout.ts - Ya implementado ✅
export async function logoutUseCase(): Promise<void> {
  try {
    await SupabaseAuthAdapter.signOut();
    useUserStore.getState().logout();
    localStorage.clear(); // ✅ Limpia todo
  } catch (error) {
    localStorage.clear(); // ✅ Limpia incluso en error
  }
}
```

## 🔧 Implementación de Mejoras

### **Paso 1: Modificar Entity User**

```typescript
// src/domain/entities/User.ts
export interface User {
  id: string;
  name?: string; // Opcional, obtener del servidor
  email?: string; // Opcional, obtener del servidor
}

// NO persistir AuthSession completa
export interface AuthSession {
  // Solo para uso en memoria, nunca persistir
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}
```

### **Paso 2: Implementar TTL (Time To Live)**

```typescript
// Opcional: Agregar expiración a datos persistidos
interface PersistedData {
  isAuthenticated: boolean;
  timestamp: number;
  ttl: number; // Tiempo de vida en milisegundos
}

const isDataExpired = (data: PersistedData): boolean => {
  return Date.now() - data.timestamp > data.ttl;
};
```

### **Paso 3: Auditoría de selectionStore**

```typescript
// src/infrastructure/store/selectionStore.ts
// Revisar si es necesario persistir:
{
  level: string | null,
  topic: string | null,
  user: string | null // ⚠️ Evaluar si es necesario
}
```

## 🎯 Principios de Seguridad

### **1. Principio de Menor Privilegio**
- Solo almacenar datos absolutamente necesarios
- Minimizar superficie de ataque
- Evaluar cada dato antes de persistir

### **2. Separación de Responsabilidades**
- **localStorage**: Solo estado de UI/UX
- **Memoria**: Datos sensibles durante la sesión
- **Servidor**: Fuente de verdad para datos del usuario

### **3. Defensa en Profundidad**
- Validación en cliente y servidor
- Limpieza automática en logout
- Expiración automática de datos

### **4. Transparencia y Auditoría**
- Documentar qué se almacena y por qué
- Revisar periódicamente datos persistidos
- Implementar logging de acceso a datos sensibles

## 📊 Matriz de Riesgo

| Dato | Riesgo | Acción | Prioridad |
|------|--------|--------|-----------|
| `access_token` | 🔴 Crítico | Eliminar | 1 |
| `refresh_token` | 🔴 Crítico | Eliminar | 1 |
| `email` | 🟠 Alto | Eliminar | 1 |
| `user_metadata` | 🟠 Alto | Eliminar | 1 |
| `identities` | 🟠 Alto | Eliminar | 1 |
| `userId` | 🟡 Medio | Evaluar | 2 |
| `isAuthenticated` | 🟢 Bajo | Mantener | 3 |
| `selection data` | 🟡 Medio | Revisar | 2 |

## 🚀 Plan de Implementación

### **Fase 1: Crítica (Inmediata)**
1. Modificar `userStore` para eliminar datos sensibles
2. Implementar obtención de datos del servidor
3. Probar funcionalidad de autenticación

### **Fase 2: Mejoras (1-2 semanas)**
1. Revisar y optimizar `selectionStore`
2. Implementar TTL para datos persistidos
3. Agregar auditoría de datos

### **Fase 3: Monitoreo (Continuo)**
1. Revisar periódicamente localStorage
2. Auditar nuevas funcionalidades
3. Actualizar guías de seguridad

## 📚 Recursos Adicionales

- [OWASP Web Storage Security](https://owasp.org/www-community/vulnerabilities/HTML5_Local_Storage)
- [Supabase Auth Security Best Practices](https://supabase.com/docs/guides/auth/sessions)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## 🔄 Revisión y Actualización

**Última actualización:** $(date)
**Próxima revisión:** $(date + 3 meses)
**Responsable:** Equipo de Desarrollo

---

> ⚠️ **Nota Importante:** Esta guía debe revisarse y actualizarse regularmente conforme evoluciona la aplicación y emergen nuevas amenazas de seguridad.