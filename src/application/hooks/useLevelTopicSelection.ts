import { useEffect } from 'react';
import { useLevelTopicStore } from '../../infrastructure/store/levelTopicStore';
import {
  createLevelTopicSelectionUseCase,
  getUserLevelTopicSelectionsUseCase,
  deleteLevelTopicSelectionUseCase,
  updateLevelTopicSelectionUseCase
} from '../use-cases/manageLevelTopicSelection';
import type { LevelSelection } from '../../domain/entities/Level';

/**
 * Hook personalizado para manejar las selecciones de level-topic
 * Proporciona acceso al estado y funciones para gestionar las selecciones del usuario
 */
export function useLevelTopicSelection() {
  const {
    selections,
    currentSelection,
    isLoading,
    error,
    setCurrentSelection,
    clearError
  } = useLevelTopicStore();

  /**
   * Carga todas las selecciones de un usuario
   */
  const loadUserSelections = async (userId: string): Promise<LevelSelection[]> => {
    try {
      return await getUserLevelTopicSelectionsUseCase(userId);
    } catch (error) {
      console.error('Error al cargar selecciones del usuario:', error);
      throw error;
    }
  };

  /**
   * Crea una nueva selección de level-topic
   */
  const createSelection = async (
    userId: string, 
    levelId: string, 
    topicId: string
  ): Promise<LevelSelection> => {
    try {
      return await createLevelTopicSelectionUseCase(userId, levelId, topicId);
    } catch (error) {
      console.error('Error al crear selección:', error);
      throw error;
    }
  };

  /**
   * Elimina una selección de level-topic
   */
  const deleteSelection = async (selectionId: string): Promise<void> => {
    try {
      await deleteLevelTopicSelectionUseCase(selectionId);
    } catch (error) {
      console.error('Error al eliminar selección:', error);
      throw error;
    }
  };

  /**
   * Actualiza una selección de level-topic
   */
  const updateSelection = async (
    selectionId: string, 
    levelId?: string, 
    topicId?: string
  ): Promise<LevelSelection> => {
    try {
      return await updateLevelTopicSelectionUseCase(selectionId, levelId, topicId);
    } catch (error) {
      console.error('Error al actualizar selección:', error);
      throw error;
    }
  };

  /**
   * Selecciona una selección como actual
   */
  const selectSelection = (selection: LevelSelection | null) => {
    setCurrentSelection(selection);
  };

  /**
   * Limpia el error actual
   */
  const clearSelectionError = () => {
    clearError();
  };

  /**
   * Obtiene una selección por ID desde el estado actual
   */
  const getSelectionFromState = (id: string): LevelSelection | undefined => {
    return selections.find(selection => selection.id === id);
  };

  /**
   * Verifica si el usuario ya tiene una selección para un level y topic específicos
   */
  const hasSelection = (levelId: string, topicId: string): boolean => {
    return selections.some(selection => 
      selection.id_level === levelId && selection.id_topic === topicId
    );
  };

  /**
   * Obtiene la selección actual del usuario (la más reciente)
   */
  const getCurrentUserSelection = (): LevelSelection | null => {
    if (selections.length === 0) return null;
    return selections[selections.length - 1];
  };

  return {
    // Estado
    selections,
    currentSelection,
    isLoading,
    error,
    
    // Acciones
    loadUserSelections,
    createSelection,
    deleteSelection,
    updateSelection,
    selectSelection,
    clearSelectionError,
    getSelectionFromState,
    
    // Utilidades
    hasSelection,
    getCurrentUserSelection,
    
    // Computed
    hasSelections: selections.length > 0,
    selectionsCount: selections.length
  };
}

/**
 * Hook que carga automáticamente las selecciones del usuario al montar el componente
 */
export function useLevelTopicSelectionAutoLoad(userId: string | null) {
  const selectionHook = useLevelTopicSelection();
  const { loadUserSelections, selections, isLoading } = selectionHook;

  useEffect(() => {
    // Solo cargar si hay userId, no hay selecciones y no está cargando
    if (userId && selections.length === 0 && !isLoading) {
      loadUserSelections(userId).catch(error => {
        console.error('Error en carga automática de selecciones:', error);
      });
    }
  }, [userId, selections.length, isLoading, loadUserSelections]);

  return selectionHook;
}