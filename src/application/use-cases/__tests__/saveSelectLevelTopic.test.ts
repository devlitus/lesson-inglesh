import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  saveSelectLevelTopicUseCase,
  getLastSelectLevelTopicUseCase,
  getUserSelectLevelTopicUseCase,
} from "../saveSelectLevelTopic";
import { SupabaseSelectLevelTopicAdapter } from "../../../infrastructure/adapters/SupabaseSelectLevelTopicAdapter";
import { useUserStore } from "../../../infrastructure/store/userStore";
import type { SelectLevelTopic } from "../../../domain/entities/SelectLevelTopic";
import type { Level } from "../../../domain/entities/Level";
import type { Topic } from "../../../domain/entities/Topic";
import type { User } from "../../../domain/entities/User";
import { mockUser, mockLevel, mockTopic, mockSelection } from "../../../mocks/";

// Mock SupabaseSelectLevelTopicAdapter
vi.mock(
  "../../../infrastructure/adapters/SupabaseSelectLevelTopicAdapter",
  () => ({
    SupabaseSelectLevelTopicAdapter: {
      saveSelection: vi.fn(),
      getLastSelection: vi.fn(),
      getUserSelections: vi.fn(),
    },
  })
);

// Mock useUserStore
vi.mock("../../../infrastructure/store/userStore", () => ({
  useUserStore: {
    getState: vi.fn(),
  },
}));

const mockSupabaseSelectLevelTopicAdapter = SupabaseSelectLevelTopicAdapter as {
  saveSelection: ReturnType<typeof vi.fn>;
  getLastSelection: ReturnType<typeof vi.fn>;
  getUserSelections: ReturnType<typeof vi.fn>;
};

const mockUseUserStore = useUserStore as unknown as {
  getState: ReturnType<typeof vi.fn>;
};

describe("Save Select Level Topic Use Cases", () => {

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("saveSelectLevelTopicUseCase", () => {
    test("should save selection successfully", async () => {
      // Arrange: Mock authenticated user and successful save
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.saveSelection.mockResolvedValue(
        mockSelection
      );

      // Act: Call saveSelectLevelTopicUseCase
      const result = await saveSelectLevelTopicUseCase(mockLevel, mockTopic);

      // Assert: Should save selection successfully
      expect(result).toEqual(mockSelection);
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).toHaveBeenCalledWith({
        id_user: "user-123",
        id_level: "1",
        id_topic: "1",
      });
      expect(console.log).toHaveBeenCalledWith(
        "Selección guardada exitosamente:",
        {
          userId: "user-123",
          levelId: "1",
          levelTitle: "Beginner",
          topicId: "1",
          topicTitle: "Family & Relationships",
        }
      );
    });

    test("should throw error when user is not authenticated", async () => {
      // Arrange: Mock no authenticated user
      mockUseUserStore.getState.mockReturnValue({ user: null });

      // Act & Assert: Should throw authentication error
      await expect(
        saveSelectLevelTopicUseCase(mockLevel, mockTopic)
      ).rejects.toThrow(
        "Error al guardar la selección: Usuario no autenticado. Debe iniciar sesión para guardar la selección."
      );
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).not.toHaveBeenCalled();
    });

    test("should validate level parameter - null level", async () => {
      // Arrange: Mock authenticated user
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });

      // Act & Assert: Should throw validation error for null level
      await expect(
        saveSelectLevelTopicUseCase(null as unknown as Level, mockTopic)
      ).rejects.toThrow(
        "Error al guardar la selección: Level inválido. Debe proporcionar un level válido."
      );
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).not.toHaveBeenCalled();
    });

    test("should validate level parameter - level without id", async () => {
      // Arrange: Mock authenticated user and level without id
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      const levelWithoutId = { ...mockLevel, id: "" };

      // Act & Assert: Should throw validation error for level without id
      await expect(
        saveSelectLevelTopicUseCase(levelWithoutId, mockTopic)
      ).rejects.toThrow(
        "Error al guardar la selección: Level inválido. Debe proporcionar un level válido."
      );
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).not.toHaveBeenCalled();
    });

    test("should validate topic parameter - null topic", async () => {
      // Arrange: Mock authenticated user
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });

      // Act & Assert: Should throw validation error for null topic
      await expect(
        saveSelectLevelTopicUseCase(mockLevel, null as unknown as Topic)
      ).rejects.toThrow(
        "Error al guardar la selección: Topic inválido. Debe proporcionar un topic válido."
      );
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).not.toHaveBeenCalled();
    });

    test("should validate topic parameter - topic without id", async () => {
      // Arrange: Mock authenticated user and topic without id
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      const topicWithoutId = { ...mockTopic, id: "" };

      // Act & Assert: Should throw validation error for topic without id
      await expect(
        saveSelectLevelTopicUseCase(mockLevel, topicWithoutId)
      ).rejects.toThrow(
        "Error al guardar la selección: Topic inválido. Debe proporcionar un topic válido."
      );
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).not.toHaveBeenCalled();
    });

    test("should handle adapter error", async () => {
      // Arrange: Mock authenticated user and adapter error
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      const adapterError = new Error("Database connection failed");
      mockSupabaseSelectLevelTopicAdapter.saveSelection.mockRejectedValue(
        adapterError
      );

      // Act & Assert: Should throw formatted error
      await expect(
        saveSelectLevelTopicUseCase(mockLevel, mockTopic)
      ).rejects.toThrow(
        "Error al guardar la selección: Database connection failed"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error en saveSelectLevelTopicUseCase:",
        adapterError
      );
    });

    test("should handle unknown error", async () => {
      // Arrange: Mock authenticated user and unknown error
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.saveSelection.mockRejectedValue(
        "Unknown error"
      );

      // Act & Assert: Should throw generic error message
      await expect(
        saveSelectLevelTopicUseCase(mockLevel, mockTopic)
      ).rejects.toThrow("Error desconocido al guardar la selección");
      expect(console.error).toHaveBeenCalledWith(
        "Error en saveSelectLevelTopicUseCase:",
        "Unknown error"
      );
    });
  });

  describe("getLastSelectLevelTopicUseCase", () => {
    test("should get last selection successfully", async () => {
      // Arrange: Mock authenticated user and successful response
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.getLastSelection.mockResolvedValue(
        mockSelection
      );

      // Act: Call getLastSelectLevelTopicUseCase
      const result = await getLastSelectLevelTopicUseCase();

      // Assert: Should return last selection
      expect(result).toEqual(mockSelection);
      expect(
        mockSupabaseSelectLevelTopicAdapter.getLastSelection
      ).toHaveBeenCalledWith("user-123");
    });

    test("should return null when no selection exists", async () => {
      // Arrange: Mock authenticated user and null response
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.getLastSelection.mockResolvedValue(
        null
      );

      // Act: Call getLastSelectLevelTopicUseCase
      const result = await getLastSelectLevelTopicUseCase();

      // Assert: Should return null
      expect(result).toBeNull();
      expect(
        mockSupabaseSelectLevelTopicAdapter.getLastSelection
      ).toHaveBeenCalledWith("user-123");
    });

    test("should throw error when user is not authenticated", async () => {
      // Arrange: Mock no authenticated user
      mockUseUserStore.getState.mockReturnValue({ user: null });

      // Act & Assert: Should throw authentication error
      await expect(getLastSelectLevelTopicUseCase()).rejects.toThrow(
        "Error al obtener la última selección: Usuario no autenticado. Debe iniciar sesión para obtener las selecciones."
      );
      expect(
        mockSupabaseSelectLevelTopicAdapter.getLastSelection
      ).not.toHaveBeenCalled();
    });

    test("should handle adapter error", async () => {
      // Arrange: Mock authenticated user and adapter error
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      const adapterError = new Error("Selection not accessible");
      mockSupabaseSelectLevelTopicAdapter.getLastSelection.mockRejectedValue(
        adapterError
      );

      // Act & Assert: Should throw formatted error
      await expect(getLastSelectLevelTopicUseCase()).rejects.toThrow(
        "Error al obtener la última selección: Selection not accessible"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error en getLastSelectLevelTopicUseCase:",
        adapterError
      );
    });

    test("should handle unknown error", async () => {
      // Arrange: Mock authenticated user and unknown error
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.getLastSelection.mockRejectedValue(
        "Unknown error"
      );

      // Act & Assert: Should throw generic error message
      await expect(getLastSelectLevelTopicUseCase()).rejects.toThrow(
        "Error desconocido al obtener la última selección"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error en getLastSelectLevelTopicUseCase:",
        "Unknown error"
      );
    });
  });

  describe("getUserSelectLevelTopicUseCase", () => {
    const mockUserSelections: SelectLevelTopic[] = [
      mockSelection,
      {
        id: "selection-2",
        id_user: "user-123",
        id_level: "level-2",
        id_topic: "topic-2",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    test("should get user selections successfully", async () => {
      // Arrange: Mock authenticated user and successful response
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.getUserSelections.mockResolvedValue(
        mockUserSelections
      );

      // Act: Call getUserSelectLevelTopicUseCase
      const result = await getUserSelectLevelTopicUseCase();

      // Assert: Should return user selections
      expect(result).toEqual(mockUserSelections);
      expect(
        mockSupabaseSelectLevelTopicAdapter.getUserSelections
      ).toHaveBeenCalledWith("user-123");
    });

    test("should return empty array when no selections exist", async () => {
      // Arrange: Mock authenticated user and empty response
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.getUserSelections.mockResolvedValue(
        []
      );

      // Act: Call getUserSelectLevelTopicUseCase
      const result = await getUserSelectLevelTopicUseCase();

      // Assert: Should return empty array
      expect(result).toEqual([]);
      expect(
        mockSupabaseSelectLevelTopicAdapter.getUserSelections
      ).toHaveBeenCalledWith("user-123");
    });

    test("should throw error when user is not authenticated", async () => {
      // Arrange: Mock no authenticated user
      mockUseUserStore.getState.mockReturnValue({ user: null });

      // Act & Assert: Should throw authentication error
      await expect(getUserSelectLevelTopicUseCase()).rejects.toThrow(
        "Error al obtener las selecciones del usuario: Usuario no autenticado. Debe iniciar sesión para obtener las selecciones."
      );
      expect(
        mockSupabaseSelectLevelTopicAdapter.getUserSelections
      ).not.toHaveBeenCalled();
    });

    test("should handle adapter error", async () => {
      // Arrange: Mock authenticated user and adapter error
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      const adapterError = new Error("Selections not accessible");
      mockSupabaseSelectLevelTopicAdapter.getUserSelections.mockRejectedValue(
        adapterError
      );

      // Act & Assert: Should throw formatted error
      await expect(getUserSelectLevelTopicUseCase()).rejects.toThrow(
        "Error al obtener las selecciones del usuario: Selections not accessible"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error en getUserSelectLevelTopicUseCase:",
        adapterError
      );
    });

    test("should handle unknown error", async () => {
      // Arrange: Mock authenticated user and unknown error
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.getUserSelections.mockRejectedValue(
        "Unknown error"
      );

      // Act & Assert: Should throw generic error message
      await expect(getUserSelectLevelTopicUseCase()).rejects.toThrow(
        "Error desconocido al obtener las selecciones del usuario"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error en getUserSelectLevelTopicUseCase:",
        "Unknown error"
      );
    });
  });

  describe("Integration scenarios", () => {
    test("should work with realistic data flow", async () => {
      // Arrange: Realistic scenario with save and retrieve
      const realisticUser: User = {
        id: "user-real-123",
        name: "Real User",
        email: "real.user@example.com",
      };

      const realisticLevel: Level = {
        id: "beginner-001",
        title: "Beginner",
        sub_title: "Basic Level",
        description: "Perfect for those just starting their English journey",
        feature: "grammar",
        icon: "beginner-icon",
        color_scheme: "blue",
      };

      const realisticTopic: Topic = {
        id: "grammar-001",
        title: "Basic Grammar",
        description: "Fundamental English grammar concepts",
        icon: "grammar-icon",
        color_scheme: "green",
      };

      const savedSelection: SelectLevelTopic = {
        id: "selection-real-123",
        id_user: "user-real-123",
        id_level: "beginner-001",
        id_topic: "grammar-001",
        created_at: "2024-01-20T15:00:00Z",
        updated_at: "2024-01-20T15:00:00Z",
      };

      mockUseUserStore.getState.mockReturnValue({ user: realisticUser });
      mockSupabaseSelectLevelTopicAdapter.saveSelection.mockResolvedValue(
        savedSelection
      );
      mockSupabaseSelectLevelTopicAdapter.getLastSelection.mockResolvedValue(
        savedSelection
      );
      mockSupabaseSelectLevelTopicAdapter.getUserSelections.mockResolvedValue([
        savedSelection,
      ]);

      // Act: Save selection and then retrieve it
      const saveResult = await saveSelectLevelTopicUseCase(
        realisticLevel,
        realisticTopic
      );
      const lastSelection = await getLastSelectLevelTopicUseCase();
      const userSelections = await getUserSelectLevelTopicUseCase();

      // Assert: Should work with realistic data
      expect(saveResult).toEqual(savedSelection);
      expect(lastSelection).toEqual(savedSelection);
      expect(userSelections).toEqual([savedSelection]);
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).toHaveBeenCalledWith({
        id_user: "user-real-123",
        id_level: "beginner-001",
        id_topic: "grammar-001",
      });
    });

    test("should handle concurrent operations efficiently", async () => {
      // Arrange: Mock responses for concurrent calls
      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.saveSelection.mockResolvedValue(
        mockSelection
      );
      mockSupabaseSelectLevelTopicAdapter.getLastSelection.mockResolvedValue(
        mockSelection
      );
      mockSupabaseSelectLevelTopicAdapter.getUserSelections.mockResolvedValue([
        mockSelection,
      ]);

      // Act: Make concurrent calls
      const promises = [
        saveSelectLevelTopicUseCase(mockLevel, mockTopic),
        getLastSelectLevelTopicUseCase(),
        getUserSelectLevelTopicUseCase(),
      ];
      const results = await Promise.all(promises);

      // Assert: All calls should succeed
      expect(results[0]).toEqual(mockSelection);
      expect(results[1]).toEqual(mockSelection);
      expect(results[2]).toEqual([mockSelection]);
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).toHaveBeenCalledTimes(1);
      expect(
        mockSupabaseSelectLevelTopicAdapter.getLastSelection
      ).toHaveBeenCalledTimes(1);
      expect(
        mockSupabaseSelectLevelTopicAdapter.getUserSelections
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge cases", () => {
    test("should handle very long IDs", async () => {
      // Arrange: Very long but valid IDs
      const longLevel: Level = {
        ...mockLevel,
        id: "a".repeat(1000),
      };
      const longTopic: Topic = {
        ...mockTopic,
        id: "b".repeat(1000),
      };
      const longUser: User = {
        ...mockUser,
        id: "c".repeat(1000),
      };

      mockUseUserStore.getState.mockReturnValue({ user: longUser });
      mockSupabaseSelectLevelTopicAdapter.saveSelection.mockResolvedValue({
        ...mockSelection,
        id_user: longUser.id,
        id_level: longLevel.id,
        id_topic: longTopic.id,
      });

      // Act: Call with long IDs
      const result = await saveSelectLevelTopicUseCase(longLevel, longTopic);

      // Assert: Should handle long IDs correctly
      expect(result.id_user).toBe(longUser.id);
      expect(result.id_level).toBe(longLevel.id);
      expect(result.id_topic).toBe(longTopic.id);
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).toHaveBeenCalledWith({
        id_user: longUser.id,
        id_level: longLevel.id,
        id_topic: longTopic.id,
      });
    });

    test("should handle special characters in IDs", async () => {
      // Arrange: IDs with special characters
      const specialLevel: Level = {
        ...mockLevel,
        id: "level-123_test@domain.com",
      };
      const specialTopic: Topic = {
        ...mockTopic,
        id: "topic-456_test@domain.com",
      };

      mockUseUserStore.getState.mockReturnValue({ user: mockUser });
      mockSupabaseSelectLevelTopicAdapter.saveSelection.mockResolvedValue({
        ...mockSelection,
        id_level: specialLevel.id,
        id_topic: specialTopic.id,
      });

      // Act: Call with special character IDs
      const result = await saveSelectLevelTopicUseCase(
        specialLevel,
        specialTopic
      );

      // Assert: Should handle special characters correctly
      expect(result.id_level).toBe(specialLevel.id);
      expect(result.id_topic).toBe(specialTopic.id);
      expect(
        mockSupabaseSelectLevelTopicAdapter.saveSelection
      ).toHaveBeenCalledWith({
        id_user: mockUser.id,
        id_level: specialLevel.id,
        id_topic: specialTopic.id,
      });
    });
  });
});
