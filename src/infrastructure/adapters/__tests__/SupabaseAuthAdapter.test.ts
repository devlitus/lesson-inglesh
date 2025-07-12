/**
 * Tests de integración para SupabaseAuthAdapter
 * Verifica la integración correcta con Supabase Auth
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { SupabaseAuthAdapter } from '../SupabaseAuthAdapter';
import { supabase } from '../../../shared/config/supabaseClient';
import { AuthError, AuthErrorType } from '../../../domain/entities/AuthError';
import type { User } from '../../../domain/entities/User';
import type { SignInInput, SignUpInput } from '../../../domain/schemas/AuthSchema';

// Mock del cliente Supabase
vi.mock('../../../shared/config/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
  },
}));

// Mocks tipados
const mockSignInWithPassword = vi.mocked(supabase.auth.signInWithPassword);
const mockSignUp = vi.mocked(supabase.auth.signUp);
const mockSignOut = vi.mocked(supabase.auth.signOut);
const mockGetSession = vi.mocked(supabase.auth.getSession);
const mockGetUser = vi.mocked(supabase.auth.getUser);

// Datos de prueba
const mockSignInInput: SignInInput = {
  email: 'test@example.com',
  password: 'password123',
};

const mockSignUpInput: SignUpInput = {
  email: 'newuser@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

const mockSupabaseUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
  },
};

const mockExpectedUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test User',
  email: 'test@example.com',
};

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  user: mockSupabaseUser,
};

describe('SupabaseAuthAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('signIn', () => {
    test('should sign in user successfully', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockSupabaseUser, session: mockSession },
        error: null,
      });

      // Act
      const result = await SupabaseAuthAdapter.signIn(mockSignInInput);

      // Assert
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: mockSignInInput.email,
        password: mockSignInInput.password,
      });
      expect(result).toEqual(mockExpectedUser);
    });

    test('should handle Supabase auth error', async () => {
      // Arrange
      const supabaseError = { message: 'Invalid login credentials' };
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: supabaseError,
      });

      // Act & Assert
      await expect(SupabaseAuthAdapter.signIn(mockSignInInput))
        .rejects.toThrow(AuthError);
      
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: mockSignInInput.email,
        password: mockSignInInput.password,
      });
    });

    test('should handle missing user data', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      // Act & Assert
      await expect(SupabaseAuthAdapter.signIn(mockSignInInput))
        .rejects.toThrow(AuthError);
      await expect(SupabaseAuthAdapter.signIn(mockSignInInput))
        .rejects.toThrow('No se pudo obtener la información del usuario');
    });

    test('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockSignInWithPassword.mockRejectedValue(networkError);

      // Act & Assert
      await expect(SupabaseAuthAdapter.signIn(mockSignInInput))
        .rejects.toThrow(AuthError);
    });

    test('should preserve AuthError instances', async () => {
      // Arrange
      const authError = new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Test error');
      mockSignInWithPassword.mockRejectedValue(authError);

      // Act & Assert
      await expect(SupabaseAuthAdapter.signIn(mockSignInInput))
        .rejects.toThrow(authError);
    });
  });

  describe('signUp', () => {
    test('should sign up user successfully', async () => {
      // Arrange
      mockSignUp.mockResolvedValue({
        data: { user: mockSupabaseUser, session: mockSession },
        error: null,
      });

      // Act
      const result = await SupabaseAuthAdapter.signUp(mockSignUpInput);

      // Assert
      expect(mockSignUp).toHaveBeenCalledWith({
        email: mockSignUpInput.email,
        password: mockSignUpInput.password,
      });
      expect(result).toEqual(mockExpectedUser);
    });

    test('should generate name from email when user_metadata.name is missing', async () => {
      // Arrange
      const userWithoutName = {
        ...mockSupabaseUser,
        email: 'newuser@example.com',
        user_metadata: {},
      };
      mockSignUp.mockResolvedValue({
        data: { user: userWithoutName, session: mockSession },
        error: null,
      });

      // Act
      const result = await SupabaseAuthAdapter.signUp(mockSignUpInput);

      // Assert
      expect(result.name).toBe('newuser'); // Email prefix
    });

    test('should use default name when email is missing', async () => {
      // Arrange
      const userWithoutEmail = {
        ...mockSupabaseUser,
        email: null,
        user_metadata: {},
      };
      mockSignUp.mockResolvedValue({
        data: { user: userWithoutEmail, session: mockSession },
        error: null,
      });

      // Act
      const result = await SupabaseAuthAdapter.signUp(mockSignUpInput);

      // Assert
      expect(result.name).toBe('Usuario');
    });

    test('should handle Supabase signup error', async () => {
      // Arrange
      const supabaseError = { message: 'User already registered' };
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: supabaseError,
      });

      // Act & Assert
      await expect(SupabaseAuthAdapter.signUp(mockSignUpInput))
        .rejects.toThrow(AuthError);
    });

    test('should handle missing user data on signup', async () => {
      // Arrange
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      // Act & Assert
      await expect(SupabaseAuthAdapter.signUp(mockSignUpInput))
        .rejects.toThrow('No se pudo crear el usuario');
    });
  });

  describe('signOut', () => {
    test('should sign out successfully', async () => {
      // Arrange
      mockSignOut.mockResolvedValue({ error: null });

      // Act
      await SupabaseAuthAdapter.signOut();

      // Assert
      expect(mockSignOut).toHaveBeenCalledOnce();
    });

    test('should handle signOut error', async () => {
      // Arrange
      const supabaseError = { message: 'Sign out failed' };
      mockSignOut.mockResolvedValue({ error: supabaseError });

      // Act & Assert
      await expect(SupabaseAuthAdapter.signOut())
        .rejects.toThrow(AuthError);
    });

    test('should handle network errors during signOut', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockSignOut.mockRejectedValue(networkError);

      // Act & Assert
      await expect(SupabaseAuthAdapter.signOut())
        .rejects.toThrow(AuthError);
    });
  });

  describe('getCurrentUser', () => {
    test('should return user when session exists', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: mockSupabaseUser },
        error: null,
      });

      // Act
      const result = await SupabaseAuthAdapter.getCurrentUser();

      // Assert
      expect(mockGetSession).toHaveBeenCalledOnce();
      expect(mockGetUser).toHaveBeenCalledOnce();
      expect(result).toEqual(mockExpectedUser);
    });

    test('should return null when no session exists', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Act
      const result = await SupabaseAuthAdapter.getCurrentUser();

      // Assert
      expect(mockGetSession).toHaveBeenCalledOnce();
      expect(mockGetUser).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should return null when getUser returns null', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await SupabaseAuthAdapter.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    test('should return null for auth session missing error', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth session missing' },
      });

      // Act
      const result = await SupabaseAuthAdapter.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    test('should return null for session_not_found error', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'session_not_found' },
      });

      // Act
      const result = await SupabaseAuthAdapter.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    test('should return null for Invalid JWT error in catch block', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockRejectedValue(new Error('Invalid JWT'));

      // Act
      const result = await SupabaseAuthAdapter.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    test('should throw AuthError for other getUser errors', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Database connection failed' },
      });

      // Act & Assert
      await expect(SupabaseAuthAdapter.getCurrentUser())
        .rejects.toThrow(AuthError);
    });

    test('should generate name from email when user_metadata.name is missing', async () => {
      // Arrange
      const userWithoutName = {
        ...mockSupabaseUser,
        user_metadata: {},
      };
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockGetUser.mockResolvedValue({
        data: { user: userWithoutName },
        error: null,
      });

      // Act
      const result = await SupabaseAuthAdapter.getCurrentUser();

      // Assert
      expect(result?.name).toBe('test'); // Email prefix
    });

    test('should preserve AuthError instances in catch block', async () => {
      // Arrange
      const authError = new AuthError(AuthErrorType.UNKNOWN_ERROR, 'Test error');
      mockGetSession.mockRejectedValue(authError);

      // Act & Assert
      await expect(SupabaseAuthAdapter.getCurrentUser())
        .rejects.toThrow(authError);
    });
  });

  describe('error handling integration', () => {
    test('should handle multiple concurrent requests', async () => {
      // Arrange
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockSupabaseUser, session: mockSession },
        error: null,
      });

      // Act
      const promises = Array(3).fill(null).map(() => 
        SupabaseAuthAdapter.signIn(mockSignInInput)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toEqual(mockExpectedUser);
      });
      expect(mockSignInWithPassword).toHaveBeenCalledTimes(3);
    });

    test('should handle mixed success and error scenarios', async () => {
      // Arrange
      mockSignInWithPassword
        .mockResolvedValueOnce({
          data: { user: mockSupabaseUser, session: mockSession },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'Invalid credentials' },
        });

      // Act & Assert
      const successResult = await SupabaseAuthAdapter.signIn(mockSignInInput);
      expect(successResult).toEqual(mockExpectedUser);

      await expect(SupabaseAuthAdapter.signIn(mockSignInInput))
        .rejects.toThrow(AuthError);
    });
  });
});