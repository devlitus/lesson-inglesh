/**
 * Design System Hooks
 * Custom hooks for the design system
 */

import React from 'react';
import { defaultTheme, breakpoints, type Theme } from './tokens';

// =============================================================================
// HOOKS GLOBALES
// =============================================================================

/**
 * Hook para acceder al tema actual
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>(defaultTheme);
  
  const updateTheme = React.useCallback((newTheme: Theme) => {
    setCurrentTheme(newTheme);
  }, []);
  
  return {
    theme: currentTheme,
    updateTheme
  };
}

/**
 * Hook para detectar el modo oscuro
 */
export function useDarkMode() {
  const [isDark, setIsDark] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  const toggle = React.useCallback(() => {
    setIsDark(prev => !prev);
  }, []);
  
  return { isDark, toggle };
}

/**
 * Hook para detectar el tamaño de pantalla
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof breakpoints>('md');
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < parseInt(breakpoints.sm)) {
        setBreakpoint('xs');
      } else if (width < parseInt(breakpoints.md)) {
        setBreakpoint('sm');
      } else if (width < parseInt(breakpoints.lg)) {
        setBreakpoint('md');
      } else if (width < parseInt(breakpoints.xl)) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
}