import { useEffect } from 'react';
import { useUserStore } from './infrastructure/store/userStore';
import { initializeAuthUseCase } from './application/use-cases/initializeAuth';
import { LoginPage } from './ui/pages/LoginPage';
import { DashboardPage } from './ui/pages/DashboardPage';
import { Spinner } from './design-system';

function App() {
  const { user, isAuthenticated, isLoading } = useUserStore();

  useEffect(() => {
    // Inicializar autenticación al cargar la app
    initializeAuthUseCase();
  }, []);

  // Mostrar spinner mientras se inicializa
  if (isLoading) {
    return <Spinner title='Cargando...' />;
  }

  // Mostrar dashboard si está autenticado, login si no
  return (
    <div className="app">
      {isAuthenticated && user ? (
        <DashboardPage />
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

export default App
