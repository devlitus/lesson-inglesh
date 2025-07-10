import { SupabaseTopicsAdapter } from '../../infrastructure/adapters/SupabaseTopicsAdapter';
import { useTopicsStore } from '../../infrastructure/store/topicsStore';
import type { Topic } from '../../domain/entities/Topic';

/**
 * Caso de uso para obtener todos los topics de la base de datos
 * Actualiza el store global con los topics obtenidos
 */
export async function getTopicsUseCase(): Promise<Topic[]> {
  try {
    // Establecer estado de carga
    useTopicsStore.getState().setLoading(true);
    useTopicsStore.getState().clearError();
    
    // Obtener topics desde Supabase
    const topics = await SupabaseTopicsAdapter.getTopics();
    
    // Actualizar el store global
    useTopicsStore.getState().setTopics(topics);
    
    return topics;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener los topics';
    
    // Actualizar el store con el error
    useTopicsStore.getState().setError(errorMessage);
    
    console.error('Error en getTopicsUseCase:', error);
    throw error;
  } finally {
    // Quitar estado de carga
    useTopicsStore.getState().setLoading(false);
  }
}

/**
 * Caso de uso para obtener un topic específico por ID
 * Actualiza el currentTopic en el store si se encuentra
 */
export async function getTopicByIdUseCase(id: string): Promise<Topic | null> {
  try {
    // Establecer estado de carga
    useTopicsStore.getState().setLoading(true);
    useTopicsStore.getState().clearError();
    
    // Obtener topic desde Supabase
    const topic = await SupabaseTopicsAdapter.getTopicById(id);
    
    // Actualizar el store global si se encuentra el topic
    if (topic) {
      useTopicsStore.getState().setCurrentTopic(topic);
    }
    
    return topic;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener el topic';
    
    // Actualizar el store con el error
    useTopicsStore.getState().setError(errorMessage);
    
    console.error('Error en getTopicByIdUseCase:', error);
    throw error;
  } finally {
    // Quitar estado de carga
    useTopicsStore.getState().setLoading(false);
  }
}