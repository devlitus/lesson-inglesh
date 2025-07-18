import { describe, test, expect, vi, beforeEach } from 'vitest';
import { signInUserUseCase } from '../signInUser';
import { UserError, UserErrorType } from '../../../domain/entities/UserError';
import type { User } from '../../../domain/entities/User';

// Mock del adapter
vi.mock('../../../infrastructure/adapters/SupabaseUserAdapter', () => ({
  SupabaseUserAdapter: {
    signIn: vi.fn(),
  },
}));

// Mock del store
vi.mock('../../../infrastructure/store/userStore', () => ({
  useUserStore: {
    getState: vi.fn(),
  },
}));

import { SupabaseUserAdapter } from '../../../infrastructure/adapters/SupabaseUserAdapter';
import { useUserStore } from '../../../infrastructure/store/userStore';

const mockSupabaseUserAdapter = SupabaseUserAdapter as unknown as {
  signIn: ReturnType<typeof vi.fn>;
};
const mockUseUserStore = useUserStore as unknown as {
  getState: ReturnType<typeof vi.fn>;
};

// Mock del store methods
const mockUserStoreMethods = {
  setLoading: vi.fn(),
  setUser: vi.fn(),
  logout: vi.fn(),
};

describe('Sign In User Use Case', () => {
  const validSignInData = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUser: User = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock setup
    mockUseUserStore.getState = vi.fn().mockReturnValue(mockUserStoreMethods);
  });

  describe('Successful sign in', () => {
    test('should sign in user with valid credentials', async () => {
      // Arrange: Valid credentials and successful authentication
      mockSupabaseUserAdapter.signIn.mockResolvedValue(mockUser);

      // Act: Call signInUserUseCase with valid data
      await signInUserUseCase(validSignInData);

      // Assert: Verify the flow
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.setUser).toHaveBeenCalledWith(null); // Clear previous state
      expect(mockSupabaseUserAdapter.signIn).toHaveBeenCalledWith(validSignInData);
      expect(mockUserStoreMethods.setUser).toHaveBeenCalledWith(mockUser);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Validation errors', () => {
    test('should throw validation error for invalid email', async () => {
      // Arrange: Invalid email format
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Act & Assert: Should throw validation error
      await expect(signInUserUseCase(invalidData))
        .rejects.toThrow(UserError);
      
      const thrownError = await signInUserUseCase(invalidData).catch(e => e);
      expect(thrownError.type).toBe(UserErrorType.VALIDATION_ERROR);
      expect(thrownError.message).toContain('Email inválido');
    });

    test('should throw validation error for short password', async () => {
      // Arrange: Password too short
      const invalidData = {
        email: 'test@example.com',
        password: '123',
      };

      // Act & Assert: Should throw validation error
      await expect(signInUserUseCase(invalidData))
        .rejects.toThrow(UserError);
      
      const thrownError = await signInUserUseCase(invalidData).catch(e => e);
      expect(thrownError.type).toBe(UserErrorType.VALIDATION_ERROR);
      expect(thrownError.message).toContain('La contraseña debe tener al menos 6 caracteres');
    });

    test('should throw validation error for missing fields', async () => {
      // Arrange: Missing required fields
      const invalidData = {
        email: 'test@example.com',
        // password missing
      };

      // Act & Assert: Should throw validation error
      await expect(signInUserUseCase(invalidData))
        .rejects.toThrow(UserError);
      
      const thrownError = await signInUserUseCase(invalidData).catch(e => e);
      expect(thrownError.type).toBe(UserErrorType.VALIDATION_ERROR);
    });
  });

  describe('Authentication failures', () => {
    test('should handle authentication error and clean up state', async () => {
      // Arrange: Authentication failure
      const authError = new UserError(UserErrorType.INVALID_CREDENTIALS, 'Invalid credentials');
      mockSupabaseUserAdapter.signIn.mockRejectedValue(authError);

      // Act & Assert: Should throw the authentication error
      await expect(signInUserUseCase(validSignInData)).rejects.toThrow(authError);
      
      // Assert: State is cleaned up
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.setUser).toHaveBeenCalledWith(null);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should handle network error and clean up state', async () => {
      // Arrange: Network error
      const networkError = new Error('Network connection failed');
      mockSupabaseUserAdapter.signIn.mockRejectedValue(networkError);

      // Act & Assert: Should throw the network error
      await expect(signInUserUseCase(validSignInData)).rejects.toThrow(networkError);
      
      // Assert: State is cleaned up
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.setUser).toHaveBeenCalledWith(null);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('State management', () => {
    test('should always set loading to false even if error occurs', async () => {
      // Arrange: Simulate an error
      const error = new Error('Some error');
      mockSupabaseUserAdapter.signIn.mockRejectedValue(error);

      // Act: Call use case and catch error
      await signInUserUseCase(validSignInData).catch(() => {});

      // Assert: Loading should be set to false in finally block
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should clear user state before attempting sign in', async () => {
      // Arrange
      mockSupabaseUserAdapter.signIn.mockResolvedValue(mockUser);

      // Act
      await signInUserUseCase(validSignInData);

      // Assert: User should be cleared before setting new user
      const setUserCalls = mockUserStoreMethods.setUser.mock.calls;
      expect(setUserCalls[0][0]).toBeNull(); // First call clears user
      expect(setUserCalls[1][0]).toEqual(mockUser); // Second call sets new user
    });
  });
});