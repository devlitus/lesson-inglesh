/**
 * Tests unitarios para el caso de uso initializeAuthUseCase
 * Verifica la inicialización correcta de la autenticación
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { initializeAuthUseCase } from '../initializeAuth';
import { useUserStore } from '../../../infrastructure/store/userStore';
import { SupabaseAuthAdapter } from '../../../infrastructure/adapters/SupabaseAuthAdapter';
import { supabase } from '../../../shared/config/supabaseClient';
import { mockUser} from '../../../mocks'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';



// Mock de SupabaseAuthAdapter
vi.mock('../../../infrastructure/adapters/SupabaseAuthAdapter', () => ({
  SupabaseAuthAdapter: {
    getCurrentUser: vi.fn(),
  },
}));

// Mock de supabase client
vi.mock('../../../shared/config/supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            id: 'mock-subscription-id',
            callback: vi.fn(),
            unsubscribe: vi.fn(),
          },
        },
      })),
    },
  },
}));

// Mock session data
const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john.doe@example.com',
    user_metadata: {
      name: 'John Doe',
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
  },
};

describe('initializeAuthUseCase', () => {
  const mockGetCurrentUser = vi.mocked(SupabaseAuthAdapter.getCurrentUser);
  const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange);

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset user store
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful initialization', () => {
    test('should set loading state during initialization', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(null);
      
      // Act
      const initPromise = initializeAuthUseCase();
      
      // Assert: Loading should be true during execution
      expect(useUserStore.getState().isLoading).toBe(true);
      
      // Wait for completion
      await initPromise;
      
      // Assert: Loading should be false after completion
      expect(useUserStore.getState().isLoading).toBe(false);
    });

    test('should set user when getCurrentUser returns a user', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(mockUser);
      
      // Act
      await initializeAuthUseCase();
      
      // Assert
      const state = useUserStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    test('should set user to null when getCurrentUser returns null', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(null);
      
      // Act
      await initializeAuthUseCase();
      
      // Assert
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    test('should setup auth state change listener when user exists', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(mockUser);
      
      // Act
      await initializeAuthUseCase();
      
      // Assert
      expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
    });

    test('should not setup auth state change listener when no user', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(null);
      
      // Act
      await initializeAuthUseCase();
      
      // Assert: Should return early, so onAuthStateChange should NOT be called
      expect(mockOnAuthStateChange).not.toHaveBeenCalled();
    });
  });

  describe('auth state change listener', () => {
    test('should handle SIGNED_IN event', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(mockUser);
      let authStateCallback!: (event: AuthChangeEvent, session: Session | null) => void;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              id: 'mock-subscription-id',
              callback: vi.fn(),
              unsubscribe: vi.fn(),
            },
          },
        };
      });
      
      // Act
      await initializeAuthUseCase();
      
      // Simulate SIGNED_IN event
      authStateCallback('SIGNED_IN', mockSession);
      
      // Assert
      const state = useUserStore.getState();
      expect(state.user).toEqual({
        id: mockSession.user.id,
        name: mockSession.user.user_metadata.name,
        email: mockSession.user.email,
      });
      expect(state.isAuthenticated).toBe(true);
    });

    test('should handle SIGNED_IN event with email fallback for name', async () => {
      // Arrange
      const sessionWithoutName: Session = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: '2023-01-01T00:00:00Z',
        },
      };
      
      mockGetCurrentUser.mockResolvedValue(mockUser);
      let authStateCallback!: (event: AuthChangeEvent, session: Session | null) => void;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              id: 'mock-subscription-id',
              callback: vi.fn(),
              unsubscribe: vi.fn(),
            },
          },
        };
      });
      
      // Act
      await initializeAuthUseCase();
      authStateCallback('SIGNED_IN', sessionWithoutName);
      
      // Assert
      const state = useUserStore.getState();
      expect(state.user?.name).toBe('test');
    });

    test('should handle SIGNED_IN event with default name fallback', async () => {
      // Arrange
      const sessionWithoutEmailOrName: Session = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: '123',
          email: undefined,
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: '2023-01-01T00:00:00Z',
        },
      };
      
      mockGetCurrentUser.mockResolvedValue(mockUser);
      let authStateCallback!: (event: AuthChangeEvent, session: Session | null) => void;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              id: 'mock-subscription-id',
              callback: vi.fn(),
              unsubscribe: vi.fn(),
            },
          },
        };
      });
      
      // Act
      await initializeAuthUseCase();
      authStateCallback('SIGNED_IN', sessionWithoutEmailOrName);
      
      // Assert
      const state = useUserStore.getState();
      expect(state.user?.name).toBe('Usuario');
    });

    test('should handle SIGNED_OUT event', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(mockUser);
      let authStateCallback!: (event: AuthChangeEvent, session: Session | null) => void;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              id: 'mock-subscription-id',
              callback: vi.fn(),
              unsubscribe: vi.fn(),
            },
          },
        };
      });
      
      // Set initial authenticated state
      useUserStore.getState().setUser(mockUser);
      
      // Act
      await initializeAuthUseCase();
      authStateCallback('SIGNED_OUT', null);
      
      // Assert
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    test('should handle TOKEN_REFRESHED event', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockGetCurrentUser.mockResolvedValue(mockUser);
      let authStateCallback!: (event: AuthChangeEvent, session: Session | null) => void;
      mockOnAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: {
            subscription: {
              id: 'mock-subscription-id',
              callback: vi.fn(),
              unsubscribe: vi.fn(),
            },
          },
        };
      });
      
      // Act
      await initializeAuthUseCase();
      authStateCallback('TOKEN_REFRESHED', mockSession);
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('🔄 Token de autenticación renovado');
      
      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    test('should handle getCurrentUser error gracefully', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Supabase connection failed');
      mockGetCurrentUser.mockRejectedValue(error);
      
      // Act
      await initializeAuthUseCase();
      
      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error al inicializar autenticación:',
        error
      );
      
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });

    test('should always set loading to false even on error', async () => {
      // Arrange
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetCurrentUser.mockRejectedValue(new Error('Test error'));
      
      // Act
      await initializeAuthUseCase();
      
      // Assert
      expect(useUserStore.getState().isLoading).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    test('should complete full initialization flow with authenticated user', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(mockUser);
      
      // Act
      await initializeAuthUseCase();
      
      // Assert: Verify complete flow
      expect(mockGetCurrentUser).toHaveBeenCalledOnce();
      expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
      
      const state = useUserStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    test('should complete full initialization flow with no user', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(null);
      
      // Act
      await initializeAuthUseCase();
      
      // Assert: Verify complete flow
      expect(mockGetCurrentUser).toHaveBeenCalledOnce();
      expect(mockOnAuthStateChange).not.toHaveBeenCalled(); // Should return early
      
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});