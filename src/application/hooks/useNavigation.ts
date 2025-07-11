import { useNavigate } from 'react-router';
import { ROUTES, type AppRoute } from '../navigation/routes';

/**
 * Hook personalizado para manejar la navegación de la aplicación
 * Centraliza todas las funciones de navegación usando constantes tipadas
 */
export function useNavigation() {
  const navigate = useNavigate();

  const goToLogin = () => navigate(ROUTES.LOGIN);
  const goToDashboard = () => navigate(ROUTES.DASHBOARD);
  const goToLesson = () => navigate(ROUTES.LESSON);
  const goBack = () => navigate(-1);
  const goTo = (path: AppRoute) => navigate(path);

  return {
    goToLogin,
    goToDashboard,
    goToLesson,
    goBack,
    goTo,
  };
}