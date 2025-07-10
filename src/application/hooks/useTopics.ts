import { useEffect } from 'react';
import { useTopicsStore } from '../../infrastructure/store/topicsStore';
import { getTopicsUseCase, getTopicByIdUseCase } from '../use-cases/getTopics';
import type { Topic } from '../../domain/entities/Topic';

/**
 * Hook personalizado para manejar los topics
 * Proporciona acceso al estado de topics y funciones para cargarlos
 */
export function useTopics() {
  const {
    topics,
    currentTopic,
    isLoading,
    error,
    setCurrentTopic,
    clearError
  } = useTopicsStore();

  /**
   * Carga todos los topics
   */
  const loadTopics = async (): Promise<Topic[]> => {
    try {
      return await getTopicsUseCase();
    } catch (error) {
      console.error('Error al cargar topics:', error);
      throw error;
    }
  };

  /**
   * Carga un topic específico por ID
   */
  const loadTopicById = async (id: string): Promise<Topic | null> => {
    try {
      return await getTopicByIdUseCase(id);
    } catch (error) {
      console.error('Error al cargar topic por ID:', error);
      throw error;
    }
  };

  /**
   * Selecciona un topic como actual
   */
  const selectTopic = (topic: Topic | null) => {
    setCurrentTopic(topic);
  };

  /**
   * Limpia el error actual
   */
  const clearTopicsError = () => {
    clearError();
  };

  /**
   * Obtiene un topic por ID desde el estado actual (sin hacer petición)
   */
  const getTopicFromState = (id: string): Topic | undefined => {
    return topics.find(topic => topic.id === id);
  };

  return {
    // Estado
    topics,
    currentTopic,
    isLoading,
    error,
    
    // Acciones
    loadTopics,
    loadTopicById,
    selectTopic,
    clearTopicsError,
    getTopicFromState,
    
    // Computed
    hasTopics: topics.length > 0,
    topicsCount: topics.length
  };
}

/**
 * Hook que carga automáticamente los topics al montar el componente
 */
export function useTopicsAutoLoad() {
  const topicsHook = useTopics();
  const { loadTopics, topics, isLoading } = topicsHook;

  useEffect(() => {
    // Solo cargar si no hay topics y no está cargando
    if (topics.length === 0 && !isLoading) {
      loadTopics().catch(error => {
        console.error('Error en carga automática de topics:', error);
      });
    }
  }, [topics.length, isLoading, loadTopics]);

  return topicsHook;
}