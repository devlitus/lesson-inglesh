import { describe, test, expect, vi, beforeEach } from "vitest";
import { getTopicsUseCase, getTopicByIdUseCase } from "../getTopics";
import { SupabaseTopicsAdapter } from "../../../infrastructure/adapters/SupabaseTopicsAdapter";
import { useTopicsStore } from "../../../infrastructure/store/topicsStore";
import { mockTopic, mockTopics} from "../../../mocks";

// Mock SupabaseTopicsAdapter
vi.mock("../../../infrastructure/adapters/SupabaseTopicsAdapter", () => ({
  SupabaseTopicsAdapter: {
    getTopics: vi.fn(),
    getTopicById: vi.fn(),
  },
}));

// Mock useTopicsStore
vi.mock("../../../infrastructure/store/topicsStore", () => ({
  useTopicsStore: {
    getState: vi.fn(),
  },
}));

const mockSupabaseTopicsAdapter = SupabaseTopicsAdapter as {
  getTopics: ReturnType<typeof vi.fn>;
  getTopicById: ReturnType<typeof vi.fn>;
};

const mockUseTopicsStore = useTopicsStore as unknown as {
  getState: ReturnType<typeof vi.fn>;
};

// Mock store methods
const mockTopicsStoreMethods = {
  setLoading: vi.fn(),
  clearError: vi.fn(),
  setTopics: vi.fn(),
  setError: vi.fn(),
  setCurrentTopic: vi.fn(),
};

describe("Get Topics Use Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTopicsStore.getState.mockReturnValue(mockTopicsStoreMethods);

    // Mock console.error to avoid noise in tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("getTopicsUseCase", () => {
    
    test("should get topics successfully and update store", async () => {
      // Arrange: Mock successful response
      mockSupabaseTopicsAdapter.getTopics.mockResolvedValue(mockTopics);

      // Act: Call getTopicsUseCase
      const result = await getTopicsUseCase();

      // Assert: Should return topics and update store correctly
      expect(result).toEqual(mockTopics);
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockTopicsStoreMethods.clearError).toHaveBeenCalledWith();
      expect(mockSupabaseTopicsAdapter.getTopics).toHaveBeenCalledTimes(1);
      expect(mockTopicsStoreMethods.setTopics).toHaveBeenCalledWith(mockTopics);
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test("should handle empty topics array", async () => {
      // Arrange: Mock empty response
      mockSupabaseTopicsAdapter.getTopics.mockResolvedValue([]);

      // Act: Call getTopicsUseCase
      const result = await getTopicsUseCase();

      // Assert: Should handle empty array correctly
      expect(result).toEqual([]);
      expect(mockTopicsStoreMethods.setTopics).toHaveBeenCalledWith([]);
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test("should handle adapter error and update store", async () => {
      // Arrange: Mock adapter error
      const adapterError = new Error("Database connection failed");
      mockSupabaseTopicsAdapter.getTopics.mockRejectedValue(adapterError);

      // Act & Assert: Should throw error and update store
      await expect(getTopicsUseCase()).rejects.toThrow(adapterError);

      // Assert: Store should be updated with error
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockTopicsStoreMethods.clearError).toHaveBeenCalledWith();
      expect(mockTopicsStoreMethods.setError).toHaveBeenCalledWith(
        "Database connection failed"
      );
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalledWith(
        "Error en getTopicsUseCase:",
        adapterError
      );
    });

    test("should handle unknown error and update store", async () => {
      // Arrange: Mock unknown error (not Error instance)
      const unknownError = "Unknown error";
      mockSupabaseTopicsAdapter.getTopics.mockRejectedValue(unknownError);

      // Act & Assert: Should throw error and update store
      await expect(getTopicsUseCase()).rejects.toThrow(unknownError);

      // Assert: Store should be updated with generic error message
      expect(mockTopicsStoreMethods.setError).toHaveBeenCalledWith(
        "Error desconocido al obtener los topics"
      );
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalledWith(
        "Error en getTopicsUseCase:",
        unknownError
      );
    });

    test("should ensure loading state is always reset", async () => {
      // Arrange: Mock error
      const error = new Error("Some error");
      mockSupabaseTopicsAdapter.getTopics.mockRejectedValue(error);

      // Act: Call getTopicsUseCase and catch error
      try {
        await getTopicsUseCase();
      } catch {
        // Expected to throw
      }

      // Assert: Loading state should be reset
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test("should handle network timeout error", async () => {
      // Arrange: Mock timeout error
      const timeoutError = new Error("Request timeout");
      mockSupabaseTopicsAdapter.getTopics.mockRejectedValue(timeoutError);

      // Act & Assert: Should handle timeout error
      await expect(getTopicsUseCase()).rejects.toThrow(timeoutError);

      // Assert: Store should be updated correctly
      expect(mockTopicsStoreMethods.setError).toHaveBeenCalledWith(
        "Request timeout"
      );
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe("getTopicByIdUseCase", () => {

    test("should get topic by ID successfully and update store", async () => {
      // Arrange: Mock successful response
      mockSupabaseTopicsAdapter.getTopicById.mockResolvedValue(mockTopic);

      // Act: Call getTopicByIdUseCase
      const result = await getTopicByIdUseCase("1");

      // Assert: Should return topic and update store correctly
      expect(result).toEqual(mockTopic);
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockTopicsStoreMethods.clearError).toHaveBeenCalledWith();
      expect(mockSupabaseTopicsAdapter.getTopicById).toHaveBeenCalledWith("1");
      expect(mockTopicsStoreMethods.setCurrentTopic).toHaveBeenCalledWith(
        mockTopic
      );
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test("should return null when topic not found", async () => {
      // Arrange: Mock null response (topic not found)
      mockSupabaseTopicsAdapter.getTopicById.mockResolvedValue(null);

      // Act: Call getTopicByIdUseCase
      const result = await getTopicByIdUseCase("999");

      // Assert: Should return null and not update currentTopic
      expect(result).toBeNull();
      expect(mockSupabaseTopicsAdapter.getTopicById).toHaveBeenCalledWith(
        "999"
      );
      expect(mockTopicsStoreMethods.setCurrentTopic).not.toHaveBeenCalled();
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test("should handle adapter error and update store", async () => {
      // Arrange: Mock adapter error
      const adapterError = new Error("Topic not accessible");
      mockSupabaseTopicsAdapter.getTopicById.mockRejectedValue(adapterError);

      // Act & Assert: Should throw error and update store
      await expect(getTopicByIdUseCase("1")).rejects.toThrow(adapterError);

      // Assert: Store should be updated with error
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockTopicsStoreMethods.clearError).toHaveBeenCalledWith();
      expect(mockTopicsStoreMethods.setError).toHaveBeenCalledWith(
        "Topic not accessible"
      );
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalledWith(
        "Error en getTopicByIdUseCase:",
        adapterError
      );
    });

    test("should handle unknown error and update store", async () => {
      // Arrange: Mock unknown error (not Error instance)
      const unknownError = "Unknown error";
      mockSupabaseTopicsAdapter.getTopicById.mockRejectedValue(unknownError);

      // Act & Assert: Should throw error and update store
      await expect(getTopicByIdUseCase("1")).rejects.toThrow(unknownError);

      // Assert: Store should be updated with generic error message
      expect(mockTopicsStoreMethods.setError).toHaveBeenCalledWith(
        "Error desconocido al obtener el topic"
      );
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalledWith(
        "Error en getTopicByIdUseCase:",
        unknownError
      );
    });

    test("should ensure loading state is always reset on error", async () => {
      // Arrange: Mock error
      const error = new Error("Some error");
      mockSupabaseTopicsAdapter.getTopicById.mockRejectedValue(error);

      // Act: Call getTopicByIdUseCase and catch error
      try {
        await getTopicByIdUseCase("1");
      } catch {
        // Expected to throw
      }

      // Assert: Loading state should be reset
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(true);
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });

    test("should handle database connection error", async () => {
      // Arrange: Mock database error
      const dbError = new Error("Database connection lost");
      mockSupabaseTopicsAdapter.getTopicById.mockRejectedValue(dbError);

      // Act & Assert: Should handle database error
      await expect(getTopicByIdUseCase("1")).rejects.toThrow(dbError);

      // Assert: Store should be updated correctly
      expect(mockTopicsStoreMethods.setError).toHaveBeenCalledWith(
        "Database connection lost"
      );
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe("Integration scenarios", () => {
    test("should work with realistic topic data", async () => {
      
      mockSupabaseTopicsAdapter.getTopics.mockResolvedValue(mockTopics);
      mockSupabaseTopicsAdapter.getTopicById.mockResolvedValue(
        mockTopics[0]
      );

      // Act: Call both use cases
      const allTopics = await getTopicsUseCase();
      const specificTopic = await getTopicByIdUseCase("grammar-001");

      // Assert: Should work with realistic data
      expect(allTopics).toEqual(mockTopics);
      expect(specificTopic).toEqual(mockTopics[0]);
      expect(mockTopicsStoreMethods.setTopics).toHaveBeenCalledWith(
        mockTopics
      );
      expect(mockTopicsStoreMethods.setCurrentTopic).toHaveBeenCalledWith(
        mockTopics[0]
      );
    });

    test("should handle concurrent calls efficiently", async () => {
      
      mockSupabaseTopicsAdapter.getTopics.mockResolvedValue(mockTopics);
      mockSupabaseTopicsAdapter.getTopicById.mockResolvedValue(mockTopics[0]);

      // Act: Make concurrent calls
      const promises = [
        getTopicsUseCase(),
        getTopicByIdUseCase("1"),
        getTopicsUseCase(),
        getTopicByIdUseCase("1"),
      ];
      const results = await Promise.all(promises);

      // Assert: All calls should succeed
      expect(results[0]).toEqual(mockTopics);
      expect(results[1]).toEqual(mockTopics[0]);
      expect(results[2]).toEqual(mockTopics);
      expect(results[3]).toEqual(mockTopics[0]);
      expect(mockSupabaseTopicsAdapter.getTopics).toHaveBeenCalledTimes(2);
      expect(mockSupabaseTopicsAdapter.getTopicById).toHaveBeenCalledTimes(2);
    });

    test("should maintain store state consistency during mixed operations", async () => {
      
      const error = new Error("Topic not found");

      mockSupabaseTopicsAdapter.getTopics.mockResolvedValue(mockTopics);
      mockSupabaseTopicsAdapter.getTopicById.mockRejectedValue(error);

      // Act: Call successful operation followed by failed operation
      await getTopicsUseCase();

      try {
        await getTopicByIdUseCase("999");
      } catch {
        // Expected to fail
      }

      // Assert: Store should maintain consistency
      expect(mockTopicsStoreMethods.setTopics).toHaveBeenCalledWith(mockTopics);
      expect(mockTopicsStoreMethods.setError).toHaveBeenCalledWith(
        "Topic not found"
      );
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe("Edge cases", () => {
    test("should handle very long topic IDs", async () => {
      // Arrange: Very long but valid ID
      const longId = "a".repeat(1000);
      
      mockSupabaseTopicsAdapter.getTopicById.mockResolvedValue(mockTopic);

      // Act: Call with long ID
      const result = await getTopicByIdUseCase(longId);

      // Assert: Should handle long ID correctly
      expect(result).toEqual(mockTopic);
      expect(mockSupabaseTopicsAdapter.getTopicById).toHaveBeenCalledWith(
        longId
      );
      expect(mockTopicsStoreMethods.setCurrentTopic).toHaveBeenCalledWith(
        mockTopic
      );
    });

    test("should handle special characters in topic ID", async () => {
      // Arrange: ID with special characters
      const specialId = "topic-123_test@domain.com";
      
      mockSupabaseTopicsAdapter.getTopicById.mockResolvedValue(mockTopic);

      // Act: Call with special character ID
      const result = await getTopicByIdUseCase(specialId);

      // Assert: Should handle special characters correctly
      expect(result).toEqual(mockTopic);
      expect(mockSupabaseTopicsAdapter.getTopicById).toHaveBeenCalledWith(
        specialId
      );
      expect(mockTopicsStoreMethods.setCurrentTopic).toHaveBeenCalledWith(
        mockTopic
      );
    });

    test("should handle store method throwing errors", async () => {
      // Arrange: Store method throws error
      const storeError = new Error("Store error");
      mockTopicsStoreMethods.setTopics.mockImplementation(() => {
        throw storeError;
      });
      
      mockSupabaseTopicsAdapter.getTopics.mockResolvedValue(mockTopics);

      // Act & Assert: Should propagate store error
      await expect(getTopicsUseCase()).rejects.toThrow(storeError);

      // Assert: Loading state should still be reset
      expect(mockTopicsStoreMethods.setLoading).toHaveBeenCalledWith(false);
    });
  });
});
