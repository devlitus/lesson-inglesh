import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { SupabaseTopicsAdapter } from "../SupabaseTopicsAdapter";
import { supabase } from "../../../shared/config/supabaseClient";
import { mockTopic, mockTopics } from "../../../mocks";

// Mock del cliente de Supabase
vi.mock("../../../shared/config/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mocks de los métodos de Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();

// Mock de console.error para evitar logs en tests
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("SupabaseTopicsAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();

    // Configurar la cadena de métodos de Supabase
    (supabase.from as vi.MockedFunction<typeof supabase.from>).mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    });

    mockEq.mockReturnValue({
      single: mockSingle,
    });

    mockOrder.mockReturnValue({
      eq: mockEq,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    mockConsoleError.mockRestore();
  });

  describe("getTopics", () => {
    test("should return all topics successfully ordered by title", async () => {
      // Arrange
      mockOrder.mockResolvedValue({
        data: mockTopics,
        error: null,
      });

      // Act
      const result = await SupabaseTopicsAdapter.getTopics();

      // Assert
      expect(result).toEqual(mockTopics);
      expect(supabase.from).toHaveBeenCalledWith("topics");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("title", { ascending: true });
    });

    test("should return empty array when no topics found", async () => {
      // Arrange
      mockOrder.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const result = await SupabaseTopicsAdapter.getTopics();

      // Assert
      expect(result).toEqual([]);
    });

    test("should throw error when Supabase returns error", async () => {
      // Arrange
      const supabaseError = { message: "Database connection failed" };
      mockOrder.mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      // Act & Assert
      await expect(SupabaseTopicsAdapter.getTopics()).rejects.toThrow(
        "Error al obtener los topics: Database connection failed"
      );
    });

    test("should handle and log network errors", async () => {
      // Arrange
      const networkError = new Error("Network error");
      mockOrder.mockRejectedValue(networkError);

      // Act & Assert
      await expect(SupabaseTopicsAdapter.getTopics()).rejects.toThrow(
        "Network error"
      );
    });

    test("should handle and log unknown errors", async () => {
      // Arrange
      const unknownError = "Unknown error";
      mockOrder.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(SupabaseTopicsAdapter.getTopics()).rejects.toThrow(
        "Unknown error"
      );
    });
  });

  describe("getTopicById", () => {
    test("should return topic by id successfully", async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: mockTopic,
        error: null,
      });

      // Act
      const result = await SupabaseTopicsAdapter.getTopicById("1");

      // Assert
      expect(result).toEqual(mockTopic);
      expect(supabase.from).toHaveBeenCalledWith("topics");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "1");
      expect(mockSingle).toHaveBeenCalled();
    });

    test("should return null when topic not found (PGRST116)", async () => {
      // Arrange
      const notFoundError = { code: "PGRST116", message: "No rows returned" };
      mockSingle.mockResolvedValue({
        data: null,
        error: notFoundError,
      });

      // Act
      const result = await SupabaseTopicsAdapter.getTopicById("999");

      // Assert
      expect(result).toBeNull();
    });

    test("should throw error for other Supabase errors", async () => {
      // Arrange
      const supabaseError = { code: "OTHER_ERROR", message: "Database error" };
      mockSingle.mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      // Act & Assert
      await expect(SupabaseTopicsAdapter.getTopicById("1")).rejects.toThrow(
        "Error al obtener el topic: Database error"
      );
    });

    test("should handle and log network errors", async () => {
      // Arrange
      const networkError = new Error("Connection timeout");
      mockSingle.mockRejectedValue(networkError);

      // Act & Assert
      await expect(SupabaseTopicsAdapter.getTopicById("1")).rejects.toThrow(
        "Connection timeout"
      );
    });

    test("should handle and log unknown errors", async () => {
      // Arrange
      const unknownError = "Unknown error";
      mockSingle.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(SupabaseTopicsAdapter.getTopicById("1")).rejects.toThrow(
        "Unknown error"
      );
    });

    test("should handle empty id parameter", async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "No rows returned" },
      });

      // Act
      const result = await SupabaseTopicsAdapter.getTopicById("");

      // Assert
      expect(result).toBeNull();
      expect(mockEq).toHaveBeenCalledWith("id", "");
    });
  });

  describe("integration scenarios", () => {
    test("should handle multiple concurrent requests", async () => {
      // Arrange
      mockOrder.mockResolvedValue({
        data: mockTopics,
        error: null,
      });

      // Act
      const promises = Array(3)
        .fill(null)
        .map(() => SupabaseTopicsAdapter.getTopics());
      const results = await Promise.all(promises);

      // Assert
      results.forEach((result) => {
        expect(result).toEqual(mockTopics);
      });
      expect(mockOrder).toHaveBeenCalledTimes(3);
    });

    test("should handle mixed success and error scenarios", async () => {
      // Arrange
      mockSingle
        .mockResolvedValueOnce({
          data: mockTopic,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116", message: "No rows returned" },
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: "OTHER_ERROR", message: "Database error" },
        });

      // Act & Assert
      const result1 = await SupabaseTopicsAdapter.getTopicById("1");
      expect(result1).toEqual(mockTopic);

      const result2 = await SupabaseTopicsAdapter.getTopicById("999");
      expect(result2).toBeNull();

      await expect(SupabaseTopicsAdapter.getTopicById("error")).rejects.toThrow(
        "Error al obtener el topic: Database error"
      );
    });

    test("should verify topics are ordered alphabetically", async () => {
      // Arrange
      const unorderedTopics = [
        { ...mockTopics[2] }, // Pronunciation
        { ...mockTopics[0] }, // Grammar
        { ...mockTopics[1] }, // Vocabulary
      ];

      mockOrder.mockResolvedValue({
        data: unorderedTopics,
        error: null,
      });

      // Act
      const result = await SupabaseTopicsAdapter.getTopics();

      // Assert
      expect(result).toEqual(unorderedTopics);
      expect(mockOrder).toHaveBeenCalledWith("title", { ascending: true });
    });
  });
});
