import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useUserStore } from '../../infrastructure/store/userStore';
import { initializeAuthUseCase } from '../use-cases/initializeAuth';
import { hasUserSelectionUseCase } from '../use-cases/checkUserSelection';
import { ROUTES } from './routes';
import { Spinner } from '../../design-system';
import { ProtectedRoute } from '../../ui/components';
import { LoginPage } from '../../ui/pages/LoginPage';
import { DashboardPage } from '../../ui/pages/DashboardPage';
import { LessonPage } from '../../ui/pages/LessonPage';

/**
 * Componente principal de enrutamiento de la aplicación
 * Maneja todas las rutas públicas y protegidas
 * Inicializa la autenticación al cargar
 */
export function AppRouter() {
  const { isAuthenticated, isLoading } = useUserStore();
  const [hasSelection, setHasSelection] = useState<boolean | null>(null);
  const [isCheckingSelection, setIsCheckingSelection] = useState(false);

  useEffect(() => {
    // Inicializar autenticación al cargar la app
    initializeAuthUseCase();
  }, []);

  useEffect(() => {
    // Verificar selección del usuario cuando esté autenticado
    if (isAuthenticated && !isLoading) {
      setIsCheckingSelection(true);
      hasUserSelectionUseCase()
        .then(setHasSelection)
        .catch(() => setHasSelection(false))
        .finally(() => setIsCheckingSelection(false));
    } else {
      setHasSelection(null);
    }
  }, [isAuthenticated, isLoading]);

  // Mostrar spinner mientras se verifica la autenticación o la selección
  if (isLoading || (isAuthenticated && isCheckingSelection)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path={ROUTES.LOGIN} 
          element={
            isAuthenticated ? (
              hasSelection ? <Navigate to={ROUTES.LESSON} replace /> : <Navigate to={ROUTES.DASHBOARD} replace />
            ) : <LoginPage />
          } 
        />
        
        {/* Rutas protegidas */}
        <Route 
          path={ROUTES.DASHBOARD} 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              {hasSelection ? <Navigate to={ROUTES.LESSON} replace /> : <DashboardPage />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path={ROUTES.LESSON} 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <LessonPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta por defecto */}
        <Route 
          path={ROUTES.ROOT} 
          element={
            <Navigate 
              to={
                isAuthenticated 
                  ? (hasSelection ? ROUTES.LESSON : ROUTES.DASHBOARD)
                  : ROUTES.LOGIN
              } 
              replace 
            />
          } 
        />
        
        {/* Ruta 404 - redirige según autenticación */}
        <Route 
          path="*" 
          element={
            <Navigate 
              to={
                isAuthenticated 
                  ? (hasSelection ? ROUTES.LESSON : ROUTES.DASHBOARD)
                  : ROUTES.LOGIN
              } 
              replace 
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}