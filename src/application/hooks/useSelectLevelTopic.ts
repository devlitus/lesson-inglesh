import { useState } from 'react';
import { 
  saveSelectLevelTopicUseCase, 
  getLastSelectLevelTopicUseCase, 
  getUserSelectLevelTopicUseCase 
} from '../use-cases/saveSelectLevelTopic';
import type { SelectLevelTopic } from '../../domain/entities/SelectLevelTopic';
import type { Level } from '../../domain/entities/Level';
import type { Topic } from '../../domain/entities/Topic';

/**
 * Hook personalizado para manejar las selecciones de level y topic
 * Proporciona funciones para guardar y obtener selecciones del usuario
 */
export function useSelectLevelTopic() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSelection, setLastSelection] = useState<SelectLevelTopic | null>(null);
  const [userSelections, setUserSelections] = useState<SelectLevelTopic[]>([]);

  /**
   * Limpia el error actual
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Guarda la selección de level y topic del usuario
   * @param level - Level seleccionado
   * @param topic - Topic seleccionado
   * @returns Promise<SelectLevelTopic | null> - La selección guardada o null si hay error
   */
  const saveSelection = async (
    level: Level, 
    topic: Topic
  ): Promise<SelectLevelTopic | null> => {
    try {
      setIsLoading(true);
      clearError();
      
      const savedSelection = await saveSelectLevelTopicUseCase(level, topic);
      
      // Actualizar el estado local
      setLastSelection(savedSelection);
      
      // Agregar a la lista de selecciones del usuario
      setUserSelections(prev => [savedSelection, ...prev]);
      
      return savedSelection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la selección';
      setError(errorMessage);
      console.error('Error al guardar selección:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene la última selección del usuario
   * @returns Promise<SelectLevelTopic | null> - La última selección o null
   */
  const loadLastSelection = async (): Promise<SelectLevelTopic | null> => {
    try {
      setIsLoading(true);
      clearError();
      
      const selection = await getLastSelectLevelTopicUseCase();
      setLastSelection(selection);
      
      return selection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener la última selección';
      setError(errorMessage);
      console.error('Error al cargar última selección:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene todas las selecciones del usuario
   * @returns Promise<SelectLevelTopic[]> - Lista de selecciones
   */
  const loadUserSelections = async (): Promise<SelectLevelTopic[]> => {
    try {
      setIsLoading(true);
      clearError();
      
      const selections = await getUserSelectLevelTopicUseCase();
      setUserSelections(selections);
      
      // Si hay selecciones, establecer la primera como la última
      if (selections.length > 0) {
        setLastSelection(selections[0]);
      }
      
      return selections;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener las selecciones';
      setError(errorMessage);
      console.error('Error al cargar selecciones del usuario:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica si el usuario ya tiene una selección guardada
   * @param levelId - ID del level a verificar
   * @param topicId - ID del topic a verificar
   * @returns boolean - true si ya existe la selección
   */
  const hasSelection = (levelId: string, topicId: string): boolean => {
    return userSelections.some(
      selection => selection.id_level === levelId && selection.id_topic === topicId
    );
  };

  /**
   * Obtiene la selección más reciente que coincida con level y topic
   * @param levelId - ID del level
   * @param topicId - ID del topic
   * @returns SelectLevelTopic | null - La selección encontrada o null
   */
  const getSelectionByLevelAndTopic = (
    levelId: string, 
    topicId: string
  ): SelectLevelTopic | null => {
    return userSelections.find(
      selection => selection.id_level === levelId && selection.id_topic === topicId
    ) || null;
  };

  return {
    // Estado
    isLoading,
    error,
    lastSelection,
    userSelections,
    
    // Acciones
    saveSelection,
    loadLastSelection,
    loadUserSelections,
    clearError,
    
    // Utilidades
    hasSelection,
    getSelectionByLevelAndTopic
  };
}