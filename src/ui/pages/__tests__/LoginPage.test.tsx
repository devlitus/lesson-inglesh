/**
 * Tests unitarios para el componente LoginPage
 * Verifica la funcionalidad del formulario de autenticación
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import { useUserStore } from '../../../infrastructure/store/userStore';
import * as signInModule from '../../../application/use-cases/signIn';
import * as signUpModule from '../../../application/use-cases/signUp';
import { AuthError, AuthErrorType } from '../../../domain/entities/AuthError';

// Mock the use cases
vi.mock('../../../application/use-cases/signIn', () => ({
  signInUseCase: vi.fn(),
}));

vi.mock('../../../application/use-cases/signUp', () => ({
  signUpUseCase: vi.fn(),
}));

// Mock the user store
vi.mock('../../../infrastructure/store/userStore', () => ({
  useUserStore: vi.fn(),
}));

const mockSignInUseCase = vi.mocked(signInModule.signInUseCase);
const mockSignUpUseCase = vi.mocked(signUpModule.signUpUseCase);
const mockUseUserStore = vi.mocked(useUserStore);

describe('LoginPage Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    
    // Default mock implementation
    mockUseUserStore.mockReturnValue({
      isLoading: false,
      user: null,
      isAuthenticated: false,
      setUser: vi.fn(),
      setLoading: vi.fn(),
      clearUser: vi.fn(),
    });

    mockSignInUseCase.mockResolvedValue(undefined);
    mockSignUpUseCase.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    test('should render login form by default', () => {
      render(<LoginPage />);
      
      expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.getByText(/accede a tu cuenta de lesson inglesh/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/confirmar contraseña/i)).not.toBeInTheDocument();
    });

    test('should render all form fields', () => {
      render(<LoginPage />);
      
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Contraseña/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument();
      expect(screen.getByText(/¿olvidaste tu contraseña\?/i)).toBeInTheDocument();
    });

    test('should have proper accessibility attributes', () => {
      render(<LoginPage />);
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      
      const fieldset = screen.getByRole('group', { name: /Formulario de inicio de sesión/ });
      expect(fieldset).toBeInTheDocument();
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toBeRequired();
      
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Mode Toggle', () => {
    test('should switch to signup mode when toggle button is clicked', async () => {
      render(<LoginPage />);
      
      const toggleButton = screen.getByRole('button', { name: /regístrate aquí/i });
      await user.click(toggleButton);
      
      expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
      expect(screen.getByText(/únete a lesson inglesh/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
      expect(screen.queryByText(/¿olvidaste tu contraseña\?/i)).not.toBeInTheDocument();
    });

    test('should switch back to login mode from signup', async () => {
      render(<LoginPage />);
      
      // Switch to signup
      await user.click(screen.getByRole('button', { name: /regístrate aquí/i }));
      expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
      
      // Switch back to login
      await user.click(screen.getByRole('button', { name: /inicia sesión aquí/i }));
      expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/confirmar contraseña/i)).not.toBeInTheDocument();
    });

    test('should reset form when switching modes', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      
      // Fill form
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      // Switch mode
      await user.click(screen.getByRole('button', { name: /regístrate aquí/i }));
      
      // Check form is reset
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('');
      expect(screen.getByLabelText(/^Contraseña/)).toHaveValue('');
    });
  });

  describe('Form Validation', () => {
    test('should show email validation error for empty email', async () => {
      render(<LoginPage />);
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/El email es requerido/)).toBeInTheDocument();
      expect(mockSignInUseCase).not.toHaveBeenCalled();
    });

    test('should show email validation error for invalid email format', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/ingresa un email válido/i)).toBeInTheDocument();
      expect(mockSignInUseCase).not.toHaveBeenCalled();
    });

    test('should show password validation error for empty password', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      await user.type(emailInput, 'test@example.com');
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/La contraseña es requerida/i)).toBeInTheDocument();
      expect(mockSignInUseCase).not.toHaveBeenCalled();
    });

    test('should show password validation error for short password', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
      expect(mockSignInUseCase).not.toHaveBeenCalled();
    });

    test('should show confirm password validation error in signup mode', async () => {
      render(<LoginPage />);
      
      // Switch to signup mode
      await user.click(screen.getByRole('button', { name: /regístrate aquí/i }));
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/confirma tu contraseña/i)).toBeInTheDocument();
      expect(mockSignUpUseCase).not.toHaveBeenCalled();
    });

    test('should show password mismatch error in signup mode', async () => {
      render(<LoginPage />);
      
      // Switch to signup mode
      await user.click(screen.getByRole('button', { name: /regístrate aquí/i }));
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different123');
      
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
      expect(mockSignUpUseCase).not.toHaveBeenCalled();
    });

    test('should clear field error when user starts typing', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      
      // Trigger validation error
      await user.click(submitButton);
      expect(await screen.findByText(/El email es requerido/i)).toBeInTheDocument();
      
      // Start typing to clear error
      await user.type(emailInput, 't');
      expect(screen.queryByText(/el email es requerido/i)).not.toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    test('should toggle password visibility', async () => {
      render(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /ocultar contraseña/i })).toBeInTheDocument();
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should toggle confirm password visibility in signup mode', async () => {
      render(<LoginPage />);
      
      // Switch to signup mode
      await user.click(screen.getByRole('button', { name: /regístrate aquí/i }));
      
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const toggleButtons = screen.getAllByRole('button', { name: /mostrar contraseña/i });
      const confirmToggleButton = toggleButtons[1]; // Second toggle button is for confirm password
      
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      
      await user.click(confirmToggleButton);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Form Submission', () => {
    test('should call signInUseCase with correct data on login', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(mockSignInUseCase).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('should call signUpUseCase with correct data on signup', async () => {
      render(<LoginPage />);
      
      // Switch to signup mode
      await user.click(screen.getByRole('button', { name: /regístrate aquí/i }));
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);
      
      expect(mockSignUpUseCase).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
    });

    test('should show loading state during form submission', async () => {
      mockUseUserStore.mockReturnValue({
        isLoading: true,
        user: null,
        isAuthenticated: false,
        setUser: vi.fn(),
        setLoading: vi.fn(),
        clearUser: vi.fn(),
      });
      
      render(<LoginPage />);
      
      expect(screen.getByRole('button', { name: /iniciando sesión\.\.\./i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciando sesión\.\.\./i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /continuar con google/i })).toBeDisabled();
    });

    test('should disable form fields during loading', async () => {
      mockUseUserStore.mockReturnValue({
        isLoading: true,
        user: null,
        isAuthenticated: false,
        setUser: vi.fn(),
        setLoading: vi.fn(),
        clearUser: vi.fn(),
      });
      
      render(<LoginPage />);
      
      const fieldset = screen.getByRole('group', { name: /Formulario de inicio de sesión/i });
      expect(fieldset).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    test('should display AuthError message', async () => {
      const authError = new AuthError('Invalid credentials', AuthErrorType.INVALID_CREDENTIALS);
      mockSignInUseCase.mockRejectedValue(authError);
      
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(await screen.findByText('INVALID_CREDENTIALS')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('should display generic error for unknown errors', async () => {
      mockSignInUseCase.mockRejectedValue(new Error('Network error'));
      
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(await screen.findByText(/ha ocurrido un error inesperado/i)).toBeInTheDocument();
    });

    test('should clear errors when form is reset', async () => {
      const authError = new AuthError('INVALID_CREDENTIALS', AuthErrorType.INVALID_CREDENTIALS);
      mockSignInUseCase.mockRejectedValue(authError);
      
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(await screen.findByText('INVALID_CREDENTIALS')).toBeInTheDocument();
      
      // Switch mode to trigger form reset
      await user.click(screen.getByRole('button', { name: /regístrate aquí/i }));
      
      expect(screen.queryByText('INVALID_CREDENTIALS')).not.toBeInTheDocument();
    });
  });

  describe('Google Login', () => {
    test('should handle Google login button click', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<LoginPage />);
      
      const googleButton = screen.getByRole('button', { name: /continuar con google/i });
      await user.click(googleButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Google login clicked');
      
      consoleSpy.mockRestore();
    });

    test('should disable Google login during loading', async () => {
      mockUseUserStore.mockReturnValue({
        isLoading: true,
        user: null,
        isAuthenticated: false,
        setUser: vi.fn(),
        setLoading: vi.fn(),
        clearUser: vi.fn(),
      });
      
      render(<LoginPage />);
      
      const googleButton = screen.getByRole('button', { name: /continuar con google/i });
      expect(googleButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', () => {
      render(<LoginPage />);
      
      // Check for proper form structure
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('group')).toBeInTheDocument();
      
      // Check for required field indicators
      const emailLabel = screen.getByText(/correo electrónico/i);
      const passwordLabel = screen.getByText(/^Contraseña/);
      expect(emailLabel).toBeInTheDocument();
      expect(passwordLabel).toBeInTheDocument();
    });

    test('should associate error messages with form fields', async () => {
      render(<LoginPage />);
      
      // Clear any previous mocks to ensure clean state
      mockSignInUseCase.mockClear();
      mockSignInUseCase.mockResolvedValue(undefined);
      
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(submitButton);
      
      // Wait for error message to appear
      const emailError = await screen.findByText('El email es requerido');
      expect(emailError).toBeInTheDocument();
      
      // Check accessibility attributes
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      expect(emailError).toHaveAttribute('id', 'email-error');
      expect(emailError).toHaveAttribute('role', 'alert');
    });

    test('should have live region for general errors', async () => {
      const authError = new AuthError('INVALID_CREDENTIALS', AuthErrorType.INVALID_CREDENTIALS);
      mockSignInUseCase.mockRejectedValue(authError);
      
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/^Contraseña/);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'polite');
    });
  });
});