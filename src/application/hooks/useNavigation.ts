import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES, type AppRoute } from '../navigation/routes';

/**
 * Hook personalizado para manejar la navegación de la aplicación
 * Centraliza todas las funciones de navegación usando constantes tipadas
 */
export function useNavigation() {
  const navigate = useNavigate();

  const goToLogin = useCallback(() => navigate(ROUTES.LOGIN), [navigate]);
  const goToDashboard = useCallback(() => navigate(ROUTES.DASHBOARD), [navigate]);
  const goToLesson = useCallback(() => navigate(ROUTES.LESSON), [navigate]);
  const goBack = useCallback(() => navigate(-1), [navigate]);
  const goTo = useCallback((path: AppRoute) => navigate(path), [navigate]);

  return {
    goToLogin,
    goToDashboard,
    goToLesson,
    goBack,
    goTo,
  };
}