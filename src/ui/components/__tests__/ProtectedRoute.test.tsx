/**
 * Tests unitarios para el componente ProtectedRoute
 * Verifica la protección de rutas basada en autenticación
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { vi } from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';

// Mock de react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
      mockNavigate(to, replace);
      return <div data-testid="navigate-component">Redirecting to {to}</div>;
    },
  };
});

// Componente de prueba
const TestChild = () => <div data-testid="protected-content">Protected Content</div>;

// Wrapper con Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is authenticated', () => {
    test('should render children content', () => {
      // Arrange & Act
      renderWithRouter(
        <ProtectedRoute isAuthenticated={true}>
          <TestChild />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate-component')).not.toBeInTheDocument();
    });

    test('should not call navigate when authenticated', () => {
      // Arrange & Act
      renderWithRouter(
        <ProtectedRoute isAuthenticated={true}>
          <TestChild />
        </ProtectedRoute>
      );

      // Assert
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('when user is not authenticated', () => {
    test('should redirect to login page', () => {
      // Arrange & Act
      renderWithRouter(
        <ProtectedRoute isAuthenticated={false}>
          <TestChild />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('navigate-component')).toBeInTheDocument();
      expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });

    test('should not render children when not authenticated', () => {
      // Arrange & Act
      renderWithRouter(
        <ProtectedRoute isAuthenticated={false}>
          <TestChild />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    test('should use replace navigation', () => {
      // Arrange & Act
      renderWithRouter(
        <ProtectedRoute isAuthenticated={false}>
          <TestChild />
        </ProtectedRoute>
      );

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });
  });

  describe('edge cases', () => {
    test('should handle multiple children', () => {
      // Arrange & Act
      renderWithRouter(
        <ProtectedRoute isAuthenticated={true}>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    test('should handle null children when authenticated', () => {
      // Arrange & Act
      renderWithRouter(
        <ProtectedRoute isAuthenticated={true}>
          {null}
        </ProtectedRoute>
      );

      // Assert
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('should handle undefined isAuthenticated as false', () => {
      // Arrange & Act
      renderWithRouter(
        <ProtectedRoute isAuthenticated={undefined as any}>
          <TestChild />
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('navigate-component')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });
  });
});