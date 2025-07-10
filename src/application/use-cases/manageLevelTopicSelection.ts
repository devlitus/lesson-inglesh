import { SupabaseLevelTopicAdapter } from '../../infrastructure/adapters/SupabaseLevelTopicAdapter';
import { useLevelTopicStore } from '../../infrastructure/store/levelTopicStore';
import type { LevelSelection } from '../../domain/entities/Level';

/**
 * Caso de uso para crear una nueva selección de level-topic para un usuario
 */
export async function createLevelTopicSelectionUseCase(
  userId: string, 
  levelId: string, 
  topicId: string
): Promise<LevelSelection> {
  try {
    // Establecer estado de carga
    useLevelTopicStore.getState().setLoading(true);
    useLevelTopicStore.getState().clearError();
    
    // Crear selección en Supabase
    const selection = await SupabaseLevelTopicAdapter.createLevelTopicSelection(userId, levelId, topicId);
    
    // Actualizar el store global
    useLevelTopicStore.getState().addSelection(selection);
    
    return selection;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear la selección';
    
    // Actualizar el store con el error
    useLevelTopicStore.getState().setError(errorMessage);
    
    console.error('Error en createLevelTopicSelectionUseCase:', error);
    throw error;
  } finally {
    // Quitar estado de carga
    useLevelTopicStore.getState().setLoading(false);
  }
}

/**
 * Caso de uso para obtener todas las selecciones de un usuario
 */
export async function getUserLevelTopicSelectionsUseCase(userId: string): Promise<LevelSelection[]> {
  try {
    // Establecer estado de carga
    useLevelTopicStore.getState().setLoading(true);
    useLevelTopicStore.getState().clearError();
    
    // Obtener selecciones desde Supabase
    const selections = await SupabaseLevelTopicAdapter.getUserLevelTopicSelections(userId);
    
    // Actualizar el store global
    useLevelTopicStore.getState().setSelections(selections);
    
    return selections;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener las selecciones';
    
    // Actualizar el store con el error
    useLevelTopicStore.getState().setError(errorMessage);
    
    console.error('Error en getUserLevelTopicSelectionsUseCase:', error);
    throw error;
  } finally {
    // Quitar estado de carga
    useLevelTopicStore.getState().setLoading(false);
  }
}

/**
 * Caso de uso para eliminar una selección de level-topic
 */
export async function deleteLevelTopicSelectionUseCase(selectionId: string): Promise<void> {
  try {
    // Establecer estado de carga
    useLevelTopicStore.getState().setLoading(true);
    useLevelTopicStore.getState().clearError();
    
    // Eliminar selección en Supabase
    await SupabaseLevelTopicAdapter.deleteLevelTopicSelection(selectionId);
    
    // Actualizar el store global
    useLevelTopicStore.getState().removeSelection(selectionId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar la selección';
    
    // Actualizar el store con el error
    useLevelTopicStore.getState().setError(errorMessage);
    
    console.error('Error en deleteLevelTopicSelectionUseCase:', error);
    throw error;
  } finally {
    // Quitar estado de carga
    useLevelTopicStore.getState().setLoading(false);
  }
}

/**
 * Caso de uso para actualizar una selección de level-topic
 */
export async function updateLevelTopicSelectionUseCase(
  selectionId: string, 
  levelId?: string, 
  topicId?: string
): Promise<LevelSelection> {
  try {
    // Establecer estado de carga
    useLevelTopicStore.getState().setLoading(true);
    useLevelTopicStore.getState().clearError();
    
    // Actualizar selección en Supabase
    const updatedSelection = await SupabaseLevelTopicAdapter.updateLevelTopicSelection(selectionId, levelId, topicId);
    
    // Actualizar el store global
    useLevelTopicStore.getState().updateSelection(selectionId, updatedSelection);
    
    return updatedSelection;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar la selección';
    
    // Actualizar el store con el error
    useLevelTopicStore.getState().setError(errorMessage);
    
    console.error('Error en updateLevelTopicSelectionUseCase:', error);
    throw error;
  } finally {
    // Quitar estado de carga
    useLevelTopicStore.getState().setLoading(false);
  }
}