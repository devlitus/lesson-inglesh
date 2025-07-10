import { useEffect } from 'react';
import { useUserStore } from './infrastructure/store/userStore';
import { initializeAuthUseCase } from './application/use-cases/initializeAuth';
import { LoginPage } from './ui/pages/LoginPage';
import { Dashboard } from './ui/pages/Dashboard';
import { LoadingSpinner } from './ui/components/LoadingSpinner';

function App() {
  const { user, isAuthenticated, isLoading } = useUserStore();

  useEffect(() => {
    // Inicializar autenticación al cargar la app
    initializeAuthUseCase();
  }, []);

  // Mostrar spinner mientras se inicializa
  if (isLoading) {
    return <LoadingSpinner message="Inicializando aplicación..." />;
  }

  // Mostrar dashboard si está autenticado, login si no
  return (
    <div className="app">
      {isAuthenticated && user ? (
        <Dashboard />
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

export default App
