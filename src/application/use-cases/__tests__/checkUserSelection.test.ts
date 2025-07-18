import { describe, test, expect, vi, beforeEach } from 'vitest';
import { checkUserSelectionUseCase, hasUserSelectionUseCase } from '../checkUserSelection';
import { SupabaseSelectLevelTopicAdapter } from '../../../infrastructure/adapters/SupabaseSelectLevelTopicAdapter';
import { useUserStore } from '../../../infrastructure/store/userStore';
import { mockUser } from '../../../mocks/userMock';
import { mockSelection } from '../../../mocks/selectLevelTopicMock'

// Mock dependencies
vi.mock('../../../infrastructure/adapters/SupabaseSelectLevelTopicAdapter');
vi.mock('../../../infrastructure/store/userStore');

const mockSupabaseAdapter = SupabaseSelectLevelTopicAdapter as unknown as { getLastSelection: ReturnType<typeof vi.fn>; };
const mockUseUserStore = useUserStore as unknown as { getState: ReturnType<typeof vi.fn>; };

describe('Check User Selection Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock setup
    mockUseUserStore.getState = vi.fn();
    mockSupabaseAdapter.getLastSelection = vi.fn();
  });

  describe('checkUserSelectionUseCase', () => {
    test('should return true when user has complete selection', async () => {
      // Arrange: User with level and topic selected
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseAdapter.getLastSelection.mockResolvedValue(mockSelection);

      // Act: Call hasUserSelectionUseCase()
      const result = await checkUserSelectionUseCase();

      // Assert: Returns true
      expect(result.hasSelection).toBe(true);
      expect(result.selection).toEqual(mockSelection);
      expect(mockSupabaseAdapter.getLastSelection).toHaveBeenCalledWith(mockUser.id);
    });

    test('should return false when user has no selection', async () => {
      // Arrange: User with no selection
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseAdapter.getLastSelection.mockResolvedValue(null);

      // Act: Call checkUserSelectionUseCase
      const result = await checkUserSelectionUseCase();

      // Assert: Returns false
      expect(result.hasSelection).toBe(false);
      expect(result.selection).toBeNull();
      expect(mockSupabaseAdapter.getLastSelection).toHaveBeenCalledWith(mockUser.id);
    });

    test('should throw error when user is not authenticated', async () => {
      // Arrange: No authenticated user
      mockUseUserStore.getState.mockReturnValue({ user: null });

      // Act & Assert: Should throw error
      await expect(checkUserSelectionUseCase()).rejects.toThrow('Usuario no autenticado');
      expect(mockSupabaseAdapter.getLastSelection).not.toHaveBeenCalled();
    });

    test('should throw error when adapter fails', async () => {
      // Arrange: Authenticated user but adapter fails
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      const adapterError = new Error('Database connection failed');
      mockSupabaseAdapter.getLastSelection.mockRejectedValue(adapterError);

      // Act & Assert: Should throw error with proper message
      await expect(checkUserSelectionUseCase()).rejects.toThrow(
        'Error al verificar selección del usuario: Database connection failed'
      );
      expect(mockSupabaseAdapter.getLastSelection).toHaveBeenCalledWith(mockUser.id);
    });

    test('should handle unknown errors gracefully', async () => {
      // Arrange: Authenticated user but unknown error
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseAdapter.getLastSelection.mockRejectedValue('Unknown error');

      // Act & Assert: Should throw error with generic message
      await expect(checkUserSelectionUseCase()).rejects.toThrow(
        'Error desconocido al verificar selección del usuario'
      );
    });
  });

  describe('hasUserSelectionUseCase', () => {
    test('should return true when user has selection', async () => {
      // Arrange: User with selection
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseAdapter.getLastSelection.mockResolvedValue(mockSelection);

      // Act: Call hasUserSelectionUseCase
      const result = await hasUserSelectionUseCase();

      // Assert: Returns true
      expect(result).toBe(true);
    });

    test('should return false when user has no selection', async () => {
      // Arrange: User with no selection
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseAdapter.getLastSelection.mockResolvedValue(null);

      // Act: Call hasUserSelectionUseCase
      const result = await hasUserSelectionUseCase();

      // Assert: Returns false
      expect(result).toBe(false);
    });

    test('should return false when checkUserSelectionUseCase throws error', async () => {
      // Arrange: Error in checkUserSelectionUseCase
      mockUseUserStore.getState.mockReturnValue({ user: null });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act: Call hasUserSelectionUseCase
      const result = await hasUserSelectionUseCase();

      // Assert: Returns false and logs error
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al verificar selección del usuario:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    test('should handle adapter errors gracefully', async () => {
      // Arrange: Adapter error
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseAdapter.getLastSelection.mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act: Call hasUserSelectionUseCase
      const result = await hasUserSelectionUseCase();

      // Assert: Returns false and logs error
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Integration scenarios', () => {
    test('should work correctly with real user store state structure', async () => {
      // Arrange: Realistic store state
      mockUseUserStore.getState.mockReturnValue({
        user: mockUser,
        isAuthenticated: true
      });
      mockSupabaseAdapter.getLastSelection.mockResolvedValue(mockSelection);

      // Act: Call both functions
      const checkResult = await checkUserSelectionUseCase();
      const hasResult = await hasUserSelectionUseCase();

      // Assert: Both return consistent results
      expect(checkResult.hasSelection).toBe(true);
      expect(hasResult).toBe(true);
      expect(checkResult.selection).toEqual(mockSelection);
    });

    test('should handle partial selection data correctly', async () => {
      // Arrange: Selection with missing optional fields
      const partialSelection = {
        id: 'selection-456',
        user_id: 'user-123',
        level_id: 'intermediate',
        topic_id: 'business',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      };
      
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseAdapter.getLastSelection.mockResolvedValue(partialSelection);

      // Act: Call checkUserSelectionUseCase
      const result = await checkUserSelectionUseCase();

      // Assert: Handles partial data correctly
      expect(result.hasSelection).toBe(true);
      expect(result.selection).toEqual(partialSelection);
    });
  });
});