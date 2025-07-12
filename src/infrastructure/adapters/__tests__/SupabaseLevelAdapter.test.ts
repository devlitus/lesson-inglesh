import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { SupabaseLevelAdapter } from "../SupabaseLevelAdapter";
import { supabase } from "../../../shared/config/supabaseClient";
import { mockLevel, mockLevels } from "../../../mocks";

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

describe("SupabaseLevelAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
  });

  describe("getAllLevels", () => {
    test("should return all levels successfully", async () => {
      // Arrange
      mockSelect.mockResolvedValue({
        data: mockLevels,
        error: null,
      });

      // Act
      const result = await SupabaseLevelAdapter.getAllLevels();

      // Assert
      expect(result).toEqual(mockLevels);
      expect(supabase.from).toHaveBeenCalledWith("levels");
      expect(mockSelect).toHaveBeenCalledWith("*");
    });

    test("should return empty array when no levels found", async () => {
      // Arrange
      mockSelect.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const result = await SupabaseLevelAdapter.getAllLevels();

      // Assert
      expect(result).toEqual([]);
    });

    test("should throw error when Supabase returns error", async () => {
      // Arrange
      const supabaseError = { message: "Database connection failed" };
      mockSelect.mockResolvedValue({
        data: null,
        error: supabaseError,
      });

      // Act & Assert
      await expect(SupabaseLevelAdapter.getAllLevels()).rejects.toThrow(
        "Error al obtener los niveles: Database connection failed"
      );
    });

    test("should handle network errors", async () => {
      // Arrange
      mockSelect.mockRejectedValue(new Error("Network error"));

      // Act & Assert
      await expect(SupabaseLevelAdapter.getAllLevels()).rejects.toThrow(
        "Network error"
      );
    });

    test("should handle unknown errors", async () => {
      // Arrange
      mockSelect.mockRejectedValue("Unknown error");

      // Act & Assert
      await expect(SupabaseLevelAdapter.getAllLevels()).rejects.toThrow(
        "Error desconocido al obtener los niveles"
      );
    });
  });

  describe("getLevelById", () => {
    test("should return level by id successfully", async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: mockLevel,
        error: null,
      });

      // Act
      const result = await SupabaseLevelAdapter.getLevelById("1");

      // Assert
      expect(result).toEqual(mockLevel);
      expect(supabase.from).toHaveBeenCalledWith("levels");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "1");
      expect(mockSingle).toHaveBeenCalled();
    });

    test("should return null when level not found (PGRST116)", async () => {
      // Arrange
      const notFoundError = { code: "PGRST116", message: "No rows returned" };
      mockSingle.mockResolvedValue({
        data: null,
        error: notFoundError,
      });

      // Act
      const result = await SupabaseLevelAdapter.getLevelById("999");

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
      await expect(SupabaseLevelAdapter.getLevelById("1")).rejects.toThrow(
        "Error al obtener el nivel: Database error"
      );
    });

    test("should handle network errors", async () => {
      // Arrange
      mockSingle.mockRejectedValue(new Error("Connection timeout"));

      // Act & Assert
      await expect(SupabaseLevelAdapter.getLevelById("1")).rejects.toThrow(
        "Connection timeout"
      );
    });

    test("should handle unknown errors", async () => {
      // Arrange
      mockSingle.mockRejectedValue("Unknown error");

      // Act & Assert
      await expect(SupabaseLevelAdapter.getLevelById("1")).rejects.toThrow(
        "Error desconocido al obtener el nivel"
      );
    });

    test("should handle empty id parameter", async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "No rows returned" },
      });

      // Act
      const result = await SupabaseLevelAdapter.getLevelById("");

      // Assert
      expect(result).toBeNull();
      expect(mockEq).toHaveBeenCalledWith("id", "");
    });
  });

  describe("integration scenarios", () => {
    test("should handle multiple concurrent requests", async () => {
      // Arrange
      mockSelect.mockResolvedValue({
        data: mockLevels,
        error: null,
      });

      // Act
      const promises = Array(3)
        .fill(null)
        .map(() => SupabaseLevelAdapter.getAllLevels());
      const results = await Promise.all(promises);

      // Assert
      results.forEach((result) => {
        expect(result).toEqual(mockLevels);
      });
      expect(mockSelect).toHaveBeenCalledTimes(3);
    });

    test("should handle mixed success and error scenarios", async () => {
      // Arrange
      mockSingle
        .mockResolvedValueOnce({
          data: mockLevel,
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
      const result1 = await SupabaseLevelAdapter.getLevelById("1");
      expect(result1).toEqual(mockLevel);

      const result2 = await SupabaseLevelAdapter.getLevelById("999");
      expect(result2).toBeNull();

      await expect(SupabaseLevelAdapter.getLevelById("error")).rejects.toThrow(
        "Error al obtener el nivel: Database error"
      );
    });
  });
});
