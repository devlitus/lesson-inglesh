export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  maxRetries: number;
  retryDelay: number;
}

export const geminiConfig: GeminiConfig = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-pro',
  maxTokens: parseInt(import.meta.env.VITE_GEMINI_MAX_TOKENS || '8192'),
  temperature: parseFloat(import.meta.env.VITE_GEMINI_TEMPERATURE || '0.7'),
  maxRetries: parseInt(import.meta.env.VITE_GEMINI_MAX_RETRIES || '3'),
  retryDelay: parseInt(import.meta.env.VITE_GEMINI_RETRY_DELAY || '1000')
};

// Validar configuración
if (!geminiConfig.apiKey) {
  console.warn('VITE_GEMINI_API_KEY no está configurada. Las funciones de Gemini AI no funcionarán.');
}

export const validateGeminiConfig = (): boolean => {
  return !!geminiConfig.apiKey;
};