import React from 'react';
import { useUserStore } from '../../infrastructure/store/userStore';
import { logoutUseCase } from '../../application/use-cases/logout';
import { AuthError } from '../../domain/entities/AuthError';

export function Dashboard() {
  const { user, isLoading } = useUserStore();
  const [error, setError] = React.useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setError(null);
      await logoutUseCase();
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Error al cerrar sesión');
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>¡Bienvenido a Lesson Inglesh!</h1>
        <button 
          onClick={handleLogout}
          disabled={isLoading}
          className="logout-button"
        >
          {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
        </button>
      </div>

      <div className="user-info">
        <h2>Información del Usuario</h2>
        <div className="info-card">
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-content">
        <h2>Panel de Control</h2>
        <p>Aquí puedes gestionar tus lecciones de inglés.</p>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📚 Mis Lecciones</h3>
            <p>Accede a tus lecciones guardadas</p>
          </div>
          <div className="feature-card">
            <h3>📊 Progreso</h3>
            <p>Revisa tu progreso de aprendizaje</p>
          </div>
          <div className="feature-card">
            <h3>🎯 Objetivos</h3>
            <p>Establece y sigue tus metas</p>
          </div>
          <div className="feature-card">
            <h3>⚙️ Configuración</h3>
            <p>Personaliza tu experiencia</p>
          </div>
        </div>
      </div>
    </div>
  );
}