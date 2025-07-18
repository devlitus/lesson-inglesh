import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getLevelsUseCase, getLevelByIdUseCase } from '../getLevels';
import { SupabaseLevelAdapter } from '../../../infrastructure/adapters/SupabaseLevelAdapter';
import {mockLevel, mockLevels} from '../../../mocks'

// Mock SupabaseLevelAdapter
vi.mock('../../../infrastructure/adapters/SupabaseLevelAdapter', () => ({
  SupabaseLevelAdapter: {
    getAllLevels: vi.fn(),
    getLevelById: vi.fn(),
  },
}));

const mockSupabaseLevelAdapter = SupabaseLevelAdapter as {
  getAllLevels: ReturnType<typeof vi.fn>;
  getLevelById: ReturnType<typeof vi.fn>;
};

describe('Get Levels Use Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLevelsUseCase', () => {
    test('should return all levels successfully', async () => {
      // Arrange: Mock successful response
      
      mockSupabaseLevelAdapter.getAllLevels.mockResolvedValue(mockLevels);

      // Act: Call getLevelsUseCase
      const result = await getLevelsUseCase();

      // Assert: Should return the levels
      expect(result).toEqual(mockLevels);
      expect(mockSupabaseLevelAdapter.getAllLevels).toHaveBeenCalledTimes(1);
      expect(mockSupabaseLevelAdapter.getAllLevels).toHaveBeenCalledWith();
    });

    test('should return empty array when no levels exist', async () => {
      // Arrange: Mock empty response
      mockSupabaseLevelAdapter.getAllLevels.mockResolvedValue([]);

      // Act: Call getLevelsUseCase
      const result = await getLevelsUseCase();

      // Assert: Should return empty array
      expect(result).toEqual([]);
      expect(mockSupabaseLevelAdapter.getAllLevels).toHaveBeenCalledTimes(1);
    });

    test('should handle adapter error with custom message', async () => {
      // Arrange: Mock adapter error
      const adapterError = new Error('Database connection failed');
      mockSupabaseLevelAdapter.getAllLevels.mockRejectedValue(adapterError);

      // Act & Assert: Should throw formatted error
      await expect(getLevelsUseCase()).rejects.toThrow(
        'Error al obtener los niveles: Database connection failed'
      );
      expect(mockSupabaseLevelAdapter.getAllLevels).toHaveBeenCalledTimes(1);
    });

    test('should handle unknown error', async () => {
      // Arrange: Mock unknown error (not Error instance)
      mockSupabaseLevelAdapter.getAllLevels.mockRejectedValue('Unknown error');

      // Act & Assert: Should throw generic error message
      await expect(getLevelsUseCase()).rejects.toThrow(
        'Error desconocido al obtener los niveles'
      );
      expect(mockSupabaseLevelAdapter.getAllLevels).toHaveBeenCalledTimes(1);
    });

    test('should handle network timeout error', async () => {
      // Arrange: Mock network timeout
      const timeoutError = new Error('Request timeout');
      mockSupabaseLevelAdapter.getAllLevels.mockRejectedValue(timeoutError);

      // Act & Assert: Should throw formatted timeout error
      await expect(getLevelsUseCase()).rejects.toThrow(
        'Error al obtener los niveles: Request timeout'
      );
    });
  });

  describe('getLevelByIdUseCase', () => {
    

    test('should return level by ID successfully', async () => {
      // Arrange: Mock successful response
      mockSupabaseLevelAdapter.getLevelById.mockResolvedValue(mockLevel);

      // Act: Call getLevelByIdUseCase
      const result = await getLevelByIdUseCase('1');

      // Assert: Should return the level
      expect(result).toEqual(mockLevel);
      expect(mockSupabaseLevelAdapter.getLevelById).toHaveBeenCalledTimes(1);
      expect(mockSupabaseLevelAdapter.getLevelById).toHaveBeenCalledWith('1');
    });

    test('should return null when level not found', async () => {
      // Arrange: Mock null response (level not found)
      mockSupabaseLevelAdapter.getLevelById.mockResolvedValue(null);

      // Act: Call getLevelByIdUseCase
      const result = await getLevelByIdUseCase('999');

      // Assert: Should return null
      expect(result).toBeNull();
      expect(mockSupabaseLevelAdapter.getLevelById).toHaveBeenCalledWith('999');
    });

    test('should validate ID parameter - empty string', async () => {
      // Act & Assert: Should throw validation error for empty string
      await expect(getLevelByIdUseCase('')).rejects.toThrow(
        'ID del nivel es requerido y debe ser una cadena válida'
      );
      expect(mockSupabaseLevelAdapter.getLevelById).not.toHaveBeenCalled();
    });

    test('should validate ID parameter - null', async () => {
      // Act & Assert: Should throw validation error for null
      await expect(getLevelByIdUseCase(null as unknown as string)).rejects.toThrow(
        'ID del nivel es requerido y debe ser una cadena válida'
      );
      expect(mockSupabaseLevelAdapter.getLevelById).not.toHaveBeenCalled();
    });

    test('should validate ID parameter - undefined', async () => {
      // Act & Assert: Should throw validation error for undefined
      await expect(getLevelByIdUseCase(undefined as unknown as string)).rejects.toThrow(
        'ID del nivel es requerido y debe ser una cadena válida'
      );
      expect(mockSupabaseLevelAdapter.getLevelById).not.toHaveBeenCalled();
    });

    test('should validate ID parameter - non-string type', async () => {
      // Act & Assert: Should throw validation error for number
      await expect(getLevelByIdUseCase(123 as unknown as string)).rejects.toThrow(
        'ID del nivel es requerido y debe ser una cadena válida'
      );
      expect(mockSupabaseLevelAdapter.getLevelById).not.toHaveBeenCalled();
    });

    test('should handle adapter error with custom message', async () => {
      // Arrange: Mock adapter error
      const adapterError = new Error('Level not accessible');
      mockSupabaseLevelAdapter.getLevelById.mockRejectedValue(adapterError);

      // Act & Assert: Should throw formatted error
      await expect(getLevelByIdUseCase('1')).rejects.toThrow(
        'Error al obtener el nivel: Level not accessible'
      );
      expect(mockSupabaseLevelAdapter.getLevelById).toHaveBeenCalledWith('1');
    });

    test('should handle unknown error', async () => {
      // Arrange: Mock unknown error (not Error instance)
      mockSupabaseLevelAdapter.getLevelById.mockRejectedValue('Unknown error');

      // Act & Assert: Should throw generic error message
      await expect(getLevelByIdUseCase('1')).rejects.toThrow(
        'Error desconocido al obtener el nivel'
      );
      expect(mockSupabaseLevelAdapter.getLevelById).toHaveBeenCalledWith('1');
    });

    test('should handle database connection error', async () => {
      // Arrange: Mock database error
      const dbError = new Error('Database connection lost');
      mockSupabaseLevelAdapter.getLevelById.mockRejectedValue(dbError);

      // Act & Assert: Should throw formatted database error
      await expect(getLevelByIdUseCase('1')).rejects.toThrow(
        'Error al obtener el nivel: Database connection lost'
      );
    });
  });

  describe('Integration scenarios', () => {
    test('should work with realistic level data', async () => {
            
      mockSupabaseLevelAdapter.getAllLevels.mockResolvedValue(mockLevels);
      mockSupabaseLevelAdapter.getLevelById.mockResolvedValue(mockLevels[0]);

      // Act: Call both use cases
      const allLevels = await getLevelsUseCase();
      const specificLevel = await getLevelByIdUseCase('beginner-001');

      // Assert: Should work with realistic data
      expect(allLevels).toEqual(mockLevels);
      expect(specificLevel).toEqual(mockLevels[0]);
      expect(mockSupabaseLevelAdapter.getAllLevels).toHaveBeenCalledTimes(1);
      expect(mockSupabaseLevelAdapter.getLevelById).toHaveBeenCalledWith('beginner-001');
    });

    test('should handle concurrent calls efficiently', async () => {
      
      mockSupabaseLevelAdapter.getAllLevels.mockResolvedValue(mockLevels);
      mockSupabaseLevelAdapter.getLevelById.mockResolvedValue(mockLevels[0]);

      // Act: Make concurrent calls
      const promises = [
        getLevelsUseCase(),
        getLevelByIdUseCase('1'),
        getLevelsUseCase(),
        getLevelByIdUseCase('1'),
      ];
      const results = await Promise.all(promises);

      // Assert: All calls should succeed
      expect(results[0]).toEqual(mockLevels);
      expect(results[1]).toEqual(mockLevels[0]);
      expect(results[2]).toEqual(mockLevels);
      expect(results[3]).toEqual(mockLevels[0]);
      expect(mockSupabaseLevelAdapter.getAllLevels).toHaveBeenCalledTimes(2);
      expect(mockSupabaseLevelAdapter.getLevelById).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases', () => {
    test('should handle very long level IDs', async () => {
      // Arrange: Very long but valid ID
      const longId = 'a'.repeat(1000);
      
      mockSupabaseLevelAdapter.getLevelById.mockResolvedValue(mockLevel);

      // Act: Call with long ID
      const result = await getLevelByIdUseCase(longId);

      // Assert: Should handle long ID correctly
      expect(result).toEqual(mockLevel);
      expect(mockSupabaseLevelAdapter.getLevelById).toHaveBeenCalledWith(longId);
    });

    test('should handle special characters in level ID', async () => {
      // Arrange: ID with special characters
      const specialId = 'level-123_test@domain.com';
      
      mockSupabaseLevelAdapter.getLevelById.mockResolvedValue(mockLevel);

      // Act: Call with special character ID
      const result = await getLevelByIdUseCase(specialId);

      // Assert: Should handle special characters correctly
      expect(result).toEqual(mockLevel);
      expect(mockSupabaseLevelAdapter.getLevelById).toHaveBeenCalledWith(specialId);
    });
  });
});