/**
 * Design System Constants
 * Non-component exports for the design system
 */

import { defaultTheme, colors, typography, spacing, motion } from './tokens';

// =============================================================================
// CONSTANTES Y CONFIGURACIÓN
// =============================================================================

/**
 * Versión del sistema de diseño
 */
export const DESIGN_SYSTEM_VERSION = '1.0.0';

/**
 * Configuración por defecto del sistema de diseño
 */
export const DESIGN_SYSTEM_CONFIG = {
  name: 'Lesson Inglesh Design System',
  version: DESIGN_SYSTEM_VERSION,
  prefix: 'li-',
  theme: defaultTheme,
  components: {
    atoms: ['Button', 'Input', 'Label', 'Badge', 'Spinner'],
    molecules: ['FormField', 'Card', 'Modal', 'Dropdown', 'Tooltip'],
    organisms: ['Navigation', 'Header', 'Footer']
  }
} as const;

/**
 * Función para validar la configuración del sistema de diseño
 */
export function validateDesignSystem() {
  const requiredTokens = ['colors', 'typography', 'spacing', 'motion'];
  const missingTokens = requiredTokens.filter(token => {
    try {
      // Check if the token exists in the imported tokens
      switch (token) {
        case 'colors':
          return !colors;
        case 'typography':
          return !typography;
        case 'spacing':
          return !spacing;
        case 'motion':
          return !motion;
        default:
          return true;
      }
    } catch {
      return true;
    }
  });
  
  if (missingTokens.length > 0) {
    console.warn(`Design System: Missing tokens: ${missingTokens.join(', ')}`);
    return false;
  }
  
  console.log(`Design System v${DESIGN_SYSTEM_VERSION} loaded successfully`);
  return true;
}

// Validar el sistema de diseño al importar
if (typeof window !== 'undefined') {
  validateDesignSystem();
}