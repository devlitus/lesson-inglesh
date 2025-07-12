import { describe, test, expect, vi, beforeEach } from 'vitest';
import { logoutUseCase } from '../logout';
import { SupabaseAuthAdapter } from '../../../infrastructure/adapters/SupabaseAuthAdapter';
import { useUserStore } from '../../../infrastructure/store/userStore';

// Mock dependencies
vi.mock('../../../infrastructure/adapters/SupabaseAuthAdapter');
vi.mock('../../../infrastructure/store/userStore');

const mockSupabaseAuthAdapter = SupabaseAuthAdapter as unknown as {
  signOut: ReturnType<typeof vi.fn>;
};
const mockUseUserStore = useUserStore as unknown as {
  getState: ReturnType<typeof vi.fn>;
};

const mockUserStoreMethods = {
  setLoading: vi.fn(),
  logout: vi.fn()
};

describe('Logout Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock setup
    mockUseUserStore.getState = vi.fn().mockReturnValue(mockUserStoreMethods);
    mockSupabaseAuthAdapter.signOut = vi.fn();
  });

  describe('Successful logout', () => {
    test('should logout user successfully', async () => {
      // Arrange: Successful signOut
      mockSupabaseAuthAdapter.signOut.mockResolvedValue(undefined);

      // Act: Call logoutUseCase
      await logoutUseCase();

      // Assert: All logout steps are executed
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockSupabaseAuthAdapter.signOut).toHaveBeenCalledWith();
      expect(mockUserStoreMethods.logout).toHaveBeenCalledWith();
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should handle loading state correctly during successful logout', async () => {
      // Arrange: Successful signOut
      mockSupabaseAuthAdapter.signOut.mockResolvedValue(undefined);

      // Act: Call logoutUseCase
      await logoutUseCase();

      // Assert: Loading state is managed correctly
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledTimes(2);
      expect(mockUserStoreMethods.setLoading).toHaveBeenNthCalledWith(1, true);
      expect(mockUserStoreMethods.setLoading).toHaveBeenNthCalledWith(2, false);
    });

    test('should call logout method only once on success', async () => {
      // Arrange: Successful signOut
      mockSupabaseAuthAdapter.signOut.mockResolvedValue(undefined);

      // Act: Call logoutUseCase
      await logoutUseCase();

      // Assert: Logout is called exactly once
      expect(mockUserStoreMethods.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logout failures', () => {
    test('should handle signOut error and still clean up local state', async () => {
      // Arrange: SignOut failure
      const signOutError = new Error('Network error during signOut');
      mockSupabaseAuthAdapter.signOut.mockRejectedValue(signOutError);

      // Act & Assert: Should throw the signOut error
      await expect(logoutUseCase()).rejects.toThrow(signOutError);
      
      // Assert: Local state is still cleaned up
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.logout).toHaveBeenCalledWith();
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should ensure loading state is always reset on error', async () => {
      // Arrange: Any error during signOut
      const error = new Error('Some error');
      mockSupabaseAuthAdapter.signOut.mockRejectedValue(error);

      // Act: Call logoutUseCase and catch error
      try {
        await logoutUseCase();
      } catch {
        // Expected to throw
      }

      // Assert: Loading state is reset
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should call logout once on error (in catch block)', async () => {
      // Arrange: SignOut failure
      const error = new Error('SignOut failed');
      mockSupabaseAuthAdapter.signOut.mockRejectedValue(error);

      // Act: Call logoutUseCase and catch error
      try {
        await logoutUseCase();
      } catch {
        // Expected to throw
      }

      // Assert: Logout is called once (in catch block)
      expect(mockUserStoreMethods.logout).toHaveBeenCalledTimes(1);
    });

    test('should handle timeout error gracefully', async () => {
      // Arrange: Timeout error
      const timeoutError = new Error('Request timeout');
      mockSupabaseAuthAdapter.signOut.mockRejectedValue(timeoutError);

      // Act & Assert: Should throw timeout error
      await expect(logoutUseCase()).rejects.toThrow(timeoutError);
      
      // Assert: State is cleaned up despite timeout
      expect(mockUserStoreMethods.logout).toHaveBeenCalledTimes(1);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Integration scenarios', () => {
    test('should work with realistic user store state', async () => {
      // Arrange: Realistic store state with additional properties
      const realisticStoreMethods = {
        ...mockUserStoreMethods,
        isAuthenticated: true,
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
      };
      mockUseUserStore.getState.mockReturnValue(realisticStoreMethods);
      mockSupabaseAuthAdapter.signOut.mockResolvedValue(undefined);

      // Act: Call logoutUseCase
      await logoutUseCase();

      // Assert: All expected methods are called
      expect(realisticStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(realisticStoreMethods.logout).toHaveBeenCalledWith();
      expect(realisticStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should handle concurrent logout attempts gracefully', async () => {
      // Arrange: Slow signOut response
      mockSupabaseAuthAdapter.signOut.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );

      // Act: Make concurrent calls
      const promise1 = logoutUseCase();
      const promise2 = logoutUseCase();

      // Assert: Both should complete successfully
      await expect(Promise.all([promise1, promise2])).resolves.toEqual([undefined, undefined]);
      
      // Assert: Loading state is managed for both calls
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should work when user is already logged out', async () => {
      // Arrange: User already logged out, but signOut still succeeds
      const emptyStoreMethods = {
        ...mockUserStoreMethods,
        isAuthenticated: false,
        user: null
      };
      mockUseUserStore.getState.mockReturnValue(emptyStoreMethods);
      mockSupabaseAuthAdapter.signOut.mockResolvedValue(undefined);

      // Act: Call logoutUseCase
      await logoutUseCase();

      // Assert: Should still work correctly
      expect(emptyStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockSupabaseAuthAdapter.signOut).toHaveBeenCalledWith();
      expect(emptyStoreMethods.logout).toHaveBeenCalledWith();
      expect(emptyStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should handle partial network failures gracefully', async () => {
      // Arrange: Network error that might be temporary
      const networkError = new Error('Network temporarily unavailable');
      mockSupabaseAuthAdapter.signOut.mockRejectedValue(networkError);

      // Act & Assert: Should throw network error but clean up state
      await expect(logoutUseCase()).rejects.toThrow(networkError);
      
      // Assert: Local state is cleaned up regardless of network failure
      expect(mockUserStoreMethods.logout).toHaveBeenCalledTimes(1);
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test('should maintain state consistency during error recovery', async () => {
      // Arrange: Error followed by successful retry
      const error = new Error('Temporary error');
      mockSupabaseAuthAdapter.signOut
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(undefined);

      // Act: First call fails, second succeeds
      try {
        await logoutUseCase();
      } catch {
        // Expected first call to fail
      }
      
      // Reset mocks for second call
      vi.clearAllMocks();
      mockUseUserStore.getState.mockReturnValue(mockUserStoreMethods);
      
      await logoutUseCase();

      // Assert: Second call works normally
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockSupabaseAuthAdapter.signOut).toHaveBeenCalledWith();
      expect(mockUserStoreMethods.logout).toHaveBeenCalledWith();
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('Edge cases', () => {
    test('should handle undefined return from signOut', async () => {
      // Arrange: signOut returns undefined (normal case)
      mockSupabaseAuthAdapter.signOut.mockResolvedValue(undefined);

      // Act: Call logoutUseCase
      const result = await logoutUseCase();

      // Assert: Should complete successfully
      expect(result).toBeUndefined();
      expect(mockUserStoreMethods.logout).toHaveBeenCalledWith();
    });

    test('should handle null return from signOut', async () => {
      // Arrange: signOut returns null
      mockSupabaseAuthAdapter.signOut.mockResolvedValue(null);

      // Act: Call logoutUseCase
      const result = await logoutUseCase();

      // Assert: Should complete successfully
      expect(result).toBeUndefined();
      expect(mockUserStoreMethods.logout).toHaveBeenCalledWith();
    });

    test('should handle store methods throwing errors', async () => {
      // Arrange: Store method throws error
      const storeError = new Error('Store error');
      mockUserStoreMethods.logout.mockImplementation(() => {
        throw storeError;
      });
      mockSupabaseAuthAdapter.signOut.mockResolvedValue(undefined);

      // Act & Assert: Should propagate store error
      await expect(logoutUseCase()).rejects.toThrow(storeError);
      
      // Assert: Loading state is still reset
      expect(mockUserStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });
});