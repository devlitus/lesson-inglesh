import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno basadas en el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    
    // Configuración específica para diferentes modos
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME || 'Lesson Inglesh'),
    },
    
    // Configuración de build optimizada según el entorno
    build: {
      // En producción, optimizar más agresivamente
      minify: mode === 'production' ? 'esbuild' : false,
      sourcemap: mode === 'development',
      
      // Configuración de chunks para mejor caching en producción
      rollupOptions: {
        output: {
          manualChunks: mode === 'production' ? {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js'],
            gemini: ['@google/genai'],
          } : undefined,
        },
      },
    },
    
    // Configuración del servidor de desarrollo
    server: {
      port: 5173,
      host: true,
      // Solo mostrar logs detallados en desarrollo
      logLevel: env.VITE_DEBUG === 'true' ? 'info' : 'warn',
    },
    
    // Configuración del preview
    preview: {
      port: 4173,
      host: true,
    },
  }
});
