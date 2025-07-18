/**
 * ProtectedRoute Component
 * Componente para proteger rutas que requieren autenticación
 */

import { Navigate } from 'react-router';
import { ROUTES } from '../../application/navigation/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export function ProtectedRoute({ children, isAuthenticated }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}