/**
 * Configuración centralizada de rutas de la aplicación
 */

// Rutas públicas
export const PUBLIC_ROUTES = {
  LOGIN: '/login',
} as const;

// Rutas protegidas
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  LESSON: '/lesson',
} as const;

// Todas las rutas
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  ROOT: '/',
} as const;

// Tipos para TypeScript
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type ProtectedRoute = typeof PROTECTED_ROUTES[keyof typeof PROTECTED_ROUTES];
export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

// Utilidades
export const isPublicRoute = (path: string): path is PublicRoute => {
  return Object.values(PUBLIC_ROUTES).includes(path as PublicRoute);
};

export const isProtectedRoute = (path: string): path is ProtectedRoute => {
  return Object.values(PROTECTED_ROUTES).includes(path as ProtectedRoute);
};