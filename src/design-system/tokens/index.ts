/**
 * Design Tokens - Index
 * Exportación centralizada de todos los tokens del sistema de diseño
 */

import { colors, type ColorToken } from './colors';
import { typography, type TypographyToken } from './typography';
import { spacing, type SpacingToken } from './spacing';
import { motion, type MotionToken } from './motion';

// Re-export individual tokens
export { colors, type ColorToken };
export { typography, type TypographyToken };
export { spacing, type SpacingToken };
export { motion, type MotionToken };

// Tokens combinados para fácil acceso
export const tokens = {
  colors,
  typography,
  spacing,
  motion
} as const;

export type DesignTokens = typeof tokens;

// Breakpoints para responsive design
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Utilidades para acceso a tokens
export const getToken = {
  color: (path: string) => {
    const keys = path.split('.');
    let value: unknown = colors;
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key];
    }
    return value;
  },
  
  space: (key: keyof typeof spacing.space) => spacing.space[key],
  
  fontSize: (key: keyof typeof typography.fontSize) => typography.fontSize[key],
  
  shadow: (key: keyof typeof spacing.boxShadow) => spacing.boxShadow[key],
  
  radius: (key: keyof typeof spacing.borderRadius) => spacing.borderRadius[key],
  
  transition: (key: keyof typeof motion.transition) => motion.transition[key]
};

// Configuración de tema por defecto
export const defaultTheme = {
  colors: {
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    success: colors.success[500],
    error: colors.error[500],
    warning: colors.warning[500],
    info: colors.info[500],
    background: colors.white,
    surface: colors.neutral[50],
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      disabled: colors.neutral[400]
    },
    border: colors.neutral[200]
  },
  typography: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal
  },
  spacing: {
    unit: spacing.space[4], // 16px como unidad base
    containerPadding: spacing.space[6] // 24px
  },
  borderRadius: spacing.borderRadius.md,
  shadow: spacing.boxShadow.md,
  transition: motion.transition.all
} as const;

export type Theme = typeof defaultTheme;