import { describe, test, expect, vi, beforeEach } from 'vitest';
import { signInUseCase } from '../signIn';
import { AuthError, AuthErrorType } from '../../../domain/entities/AuthError';
import { SupabaseAuthAdapter } from '../../../infrastructure/adapters/SupabaseAuthAdapter';
import { useUserStore } from '../../../infrastructure/store/userStore';
import { mockUser } from '../../../mocks/userMock';
import { validSignInData } from '../../../mocks/validateSignInDataMock';


// Mock dependencies
vi.mock('../../../infrastructure/adapters/SupabaseAuthAdapter');
vi.mock('../../../infrastructure/store/userStore');

const mockSupabaseAuthAdapter = SupabaseAuthAdapter as unknown as {
  signIn: ReturnType<typeof vi.fn>;
};
const mockUseUserStore = useUserStore as unknown as {
  getState: ReturnType<typeof vi.fn>;
};

const mockUserStoreMethods = {
  setLoading: vi.fn(),
  setUser: vi.fn()
};

describe('Sign In Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock setup
    mockUseUserStore.getState = vi.fn().mockReturnValue(mockUserStoreMethods);
    mockSupabaseAuthAdapter.signIn = vi.fn();
  });

  describe('Successful sign in', () => {
    test('should sign in user with valid credentials', async () => {
      // Arrange: Valid credentials and successful authentication
      mockSupabaseAuthAdapter.signIn.mockResolvedValue(mockUser);

      // Act: Call signInUseCase with valid data
      await signInUseCase(validSignInData);

      // Assert: User store is updated correctly
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockSupabaseAuthAdapter.signIn).toHaveBeenCalledWith(validSignInData);
      expect(mockUserStoreMethods.setUser).toHaveBeenCalledWith(mockUser);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should handle loading state correctly during successful sign in', async () => {
      // Arrange: Successful authentication
      mockSupabaseAuthAdapter.signIn.mockResolvedValue(mockUser);

      // Act: Call signInUseCase
      await signInUseCase(validSignInData);

      // Assert: Loading state is managed correctly
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledTimes(2);
      expect(mockUserStoreMethods.setLoading).toHaveBeenNthCalledWith(1, true);
      expect(mockUserStoreMethods.setLoading).toHaveBeenNthCalledWith(2, false);
    });
  });

  describe('Input validation', () => {
    test('should throw AuthError for invalid email format', async () => {
      // Arrange: Invalid email format
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      // Act & Assert: Should throw validation error
      await expect(signInUseCase(invalidData)).rejects.toThrow(AuthError);
      await expect(signInUseCase(invalidData)).rejects.toThrow(
        expect.objectContaining({
          type: AuthErrorType.VALIDATION_ERROR
        })
      );
      
      // Assert: Adapter should not be called
      expect(mockSupabaseAuthAdapter.signIn).not.toHaveBeenCalled();
    });

    test('should throw AuthError for missing email', async () => {
      // Arrange: Missing email
      const invalidData = {
        password: 'password123'
      };

      // Act & Assert: Should throw validation error
      await expect(signInUseCase(invalidData)).rejects.toThrow(AuthError);
      await expect(signInUseCase(invalidData)).rejects.toThrow(
        expect.objectContaining({
          type: AuthErrorType.VALIDATION_ERROR
        })
      );
    });

    test('should throw AuthError for missing password', async () => {
      // Arrange: Missing password
      const invalidData = {
        email: 'test@example.com'
      };

      // Act & Assert: Should throw validation error
      await expect(signInUseCase(invalidData)).rejects.toThrow(AuthError);
      await expect(signInUseCase(invalidData)).rejects.toThrow(
        expect.objectContaining({
          type: AuthErrorType.VALIDATION_ERROR
        })
      );
    });

    test('should throw AuthError for empty input', async () => {
      // Arrange: Empty input
      const invalidData = {};

      // Act & Assert: Should throw validation error
      await expect(signInUseCase(invalidData)).rejects.toThrow(AuthError);
      await expect(signInUseCase(invalidData)).rejects.toThrow(
        expect.objectContaining({
          type: AuthErrorType.VALIDATION_ERROR
        })
      );
    });

    test('should throw AuthError for null input', async () => {
      // Arrange: Null input
      const invalidData = null;

      // Act & Assert: Should throw validation error
      await expect(signInUseCase(invalidData)).rejects.toThrow(AuthError);
      await expect(signInUseCase(invalidData)).rejects.toThrow(
        expect.objectContaining({
          type: AuthErrorType.VALIDATION_ERROR
        })
      );
    });

    test('should include validation error details in message', async () => {
      // Arrange: Invalid data with multiple errors
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };

      // Act & Assert: Should include detailed error message
      try {
        await signInUseCase(invalidData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).message).toContain('Datos de entrada inválidos');
      }
    });
  });

  describe('Authentication failures', () => {
    test('should handle authentication error and clean up state', async () => {
      // Arrange: Authentication failure
      const authError = new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid credentials');
      mockSupabaseAuthAdapter.signIn.mockRejectedValue(authError);

      // Act & Assert: Should throw the authentication error
      await expect(signInUseCase(validSignInData)).rejects.toThrow(authError);
      
      // Assert: State is cleaned up
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.setUser).toHaveBeenCalledWith(null);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should handle network error and clean up state', async () => {
      // Arrange: Network error
      const networkError = new Error('Network connection failed');
      mockSupabaseAuthAdapter.signIn.mockRejectedValue(networkError);

      // Act & Assert: Should throw the network error
      await expect(signInUseCase(validSignInData)).rejects.toThrow(networkError);
      
      // Assert: State is cleaned up
      expect(mockUserStoreMethods.setUser).toHaveBeenCalledWith(null);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should ensure loading state is always reset on error', async () => {
      // Arrange: Any error during authentication
      const error = new Error('Some error');
      mockSupabaseAuthAdapter.signIn.mockRejectedValue(error);

      // Act: Call signInUseCase and catch error
      try {
        await signInUseCase(validSignInData);
      } catch {
        // Expected to throw
      }

      // Assert: Loading state is reset
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Integration scenarios', () => {
    test('should work with realistic user store state', async () => {
      // Arrange: Realistic store state with additional properties
      const realisticStoreMethods = {
        ...mockUserStoreMethods,
        isAuthenticated: false,
        user: null
      };
      mockUseUserStore.getState.mockReturnValue(realisticStoreMethods);
      mockSupabaseAuthAdapter.signIn.mockResolvedValue(mockUser);

      // Act: Call signInUseCase
      await signInUseCase(validSignInData);

      // Assert: All expected methods are called
      expect(realisticStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(realisticStoreMethods.setUser).toHaveBeenCalledWith(mockUser);
      expect(realisticStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should handle user object with additional properties', async () => {
      // Arrange: User with additional properties
      const extendedUser = {
        ...mockUser,
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2024-01-01T00:00:00Z'
      };
      mockSupabaseAuthAdapter.signIn.mockResolvedValue(extendedUser);

      // Act: Call signInUseCase
      await signInUseCase(validSignInData);

      // Assert: Extended user object is set correctly
      expect(mockUserStoreMethods.setUser).toHaveBeenCalledWith(extendedUser);
    });

    test('should handle concurrent sign in attempts gracefully', async () => {
      // Arrange: Slow authentication response
      mockSupabaseAuthAdapter.signIn.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      );

      // Act: Make concurrent calls
      const promise1 = signInUseCase(validSignInData);
      const promise2 = signInUseCase(validSignInData);

      // Assert: Both should complete successfully
      await expect(Promise.all([promise1, promise2])).resolves.toEqual([undefined, undefined]);
      
      // Assert: Loading state is managed for both calls
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });
});