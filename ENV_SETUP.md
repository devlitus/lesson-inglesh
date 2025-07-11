# Configuración de Variables de Entorno

## Descripción General

Este proyecto utiliza un sistema unificado de variables de entorno que funciona tanto para desarrollo como para producción. La configuración se basa en archivos `.env` y el sistema de modos de Vite.

## Archivos de Configuración

### `.env` (Base)
Contiene todas las variables de entorno con valores por defecto para desarrollo.

### `.env.template` (Plantilla)
Plantilla con todas las variables disponibles y comentarios explicativos.

### `.env.production` (Producción)
Sobrescribe variables específicas para el entorno de producción.

## Variables Disponibles

### Configuración de Supabase
```bash
VITE_SUPABASE_URL=          # URL de tu proyecto Supabase
VITE_SUPABASE_ANON_KEY=     # Clave anónima de Supabase
```

### Configuración de Gemini AI
```bash
VITE_GEMINI_API_KEY=        # API Key de Google Gemini
VITE_GEMINI_MODEL=          # Modelo a usar (gemini-2.0-flash-exp)
VITE_GEMINI_MAX_TOKENS=     # Máximo de tokens por respuesta
VITE_GEMINI_TEMPERATURE=    # Creatividad del modelo (0.0-1.0)
VITE_GEMINI_MAX_RETRIES=    # Reintentos en caso de error
VITE_GEMINI_RETRY_DELAY=    # Delay entre reintentos (ms)
```

### Configuración de Entorno
```bash
VITE_ENV=                   # development | production
VITE_DEBUG=                 # true | false
VITE_LOG_LEVEL=            # error | warn | info | debug
```

### Configuración de Aplicación
```bash
VITE_APP_NAME=             # Nombre de la aplicación
VITE_APP_VERSION=          # Versión de la aplicación
VITE_API_BASE_URL=         # URL base para APIs externas
VITE_CDN_BASE_URL=         # URL base para CDN
```

## Scripts NPM Disponibles

### Desarrollo
```bash
npm run dev          # Servidor de desarrollo (modo development)
npm run dev:prod     # Servidor de desarrollo (modo production)
```

### Build
```bash
npm run build        # Build para producción
npm run build:dev    # Build para desarrollo
npm run build:prod   # Build para producción (explícito)
```

### Preview
```bash
npm run preview      # Preview del build (modo development)
npm run preview:prod # Preview del build (modo production)
```

## Configuración Inicial

### 1. Copia el archivo de plantilla
```bash
cp .env.template .env
```

### 2. Configura tus valores reales
Edita el archivo `.env` y reemplaza los valores de ejemplo:

```bash
# Supabase (obtén estos valores desde tu dashboard de Supabase)
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-clave-anonima"

# Gemini AI (obtén tu API key desde https://aistudio.google.com/app/apikey)
VITE_GEMINI_API_KEY="tu-api-key-de-gemini"
```

## Diferencias entre Entornos

### Desarrollo
- Debug habilitado
- Logs detallados
- Source maps habilitados
- Sin minificación
- Temperatura de Gemini más alta (creatividad)

### Producción
- Debug deshabilitado
- Solo logs de errores y warnings
- Sin source maps
- Código minificado
- Chunks optimizados para caching
- Temperatura de Gemini más baja (consistencia)
- Más reintentos para APIs

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca commitees archivos `.env` con valores reales
- El archivo `.env` está en `.gitignore`
- Solo las variables que empiezan con `VITE_` son expuestas al cliente
- Mantén tus API keys seguras

## Troubleshooting

### Variables no se cargan
1. Verifica que la variable empiece con `VITE_`
2. Reinicia el servidor de desarrollo
3. Verifica que el archivo `.env` esté en la raíz del proyecto

### Modo incorrecto
1. Verifica que estés usando el script correcto (`dev`, `dev:prod`, etc.)
2. Revisa que el archivo `.env.production` exista para modo producción

### Build falla
1. Ejecuta `npm run lint` para verificar errores de código
2. Verifica que todas las variables requeridas estén definidas
3. Revisa los logs de build para errores específicos