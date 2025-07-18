import { SupabaseSelectLevelTopicAdapter } from '../../infrastructure/adapters/SupabaseSelectLevelTopicAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';
import type { SelectLevelTopic, CreateSelectLevelTopicInput } from '../../domain/entities/SelectLevelTopic';
import type { Level } from '../../domain/entities/Level';
import type { Topic } from '../../domain/entities/Topic';

/**
 * Caso de uso para guardar la selección de level y topic del usuario
 * @param level - Level seleccionado por el usuario
 * @param topic - Topic seleccionado por el usuario
 * @returns Promise<SelectLevelTopic> - La selección guardada
 * @throws Error si no hay usuario autenticado o si falla la operación
 */
export async function saveSelectLevelTopicUseCase(
  level: Level,
  topic: Topic
): Promise<SelectLevelTopic> {
  try {
    // Obtener el usuario actual del store
    const { user } = useUserStore.getState();
    
    if (!user) {
      throw new Error('Usuario no autenticado. Debe iniciar sesión para guardar la selección.');
    }
    
    // Validar que los parámetros sean válidos
    if (!level || !level.id) {
      throw new Error('Level inválido. Debe proporcionar un level válido.');
    }
    
    if (!topic || !topic.id) {
      throw new Error('Topic inválido. Debe proporcionar un topic válido.');
    }
    
    // Preparar los datos para guardar
    const selectionData: CreateSelectLevelTopicInput = {
      id_user: user.id,
      id_level: level.id,
      id_topic: topic.id
    };
    
    // Guardar la selección en Supabase
    const savedSelection = await SupabaseSelectLevelTopicAdapter.saveSelection(selectionData);
    return savedSelection;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al guardar la selección: ${error.message}`
      : 'Error desconocido al guardar la selección';
    
    console.error('Error en saveSelectLevelTopicUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para obtener la última selección del usuario
 * @returns Promise<SelectLevelTopic | null> - La última selección o null si no existe
 * @throws Error si no hay usuario autenticado o si falla la operación
 */
export async function getLastSelectLevelTopicUseCase(): Promise<SelectLevelTopic | null> {
  try {
    // Obtener el usuario actual del store
    const { user } = useUserStore.getState();
    
    if (!user) {
      throw new Error('Usuario no autenticado. Debe iniciar sesión para obtener las selecciones.');
    }
    
    // Obtener la última selección del usuario
    const lastSelection = await SupabaseSelectLevelTopicAdapter.getLastSelection(user.id);
    
    return lastSelection;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al obtener la última selección: ${error.message}`
      : 'Error desconocido al obtener la última selección';
    
    console.error('Error en getLastSelectLevelTopicUseCase:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Caso de uso para obtener todas las selecciones del usuario
 * @returns Promise<SelectLevelTopic[]> - Lista de selecciones del usuario
 * @throws Error si no hay usuario autenticado o si falla la operación
 */
export async function getUserSelectLevelTopicUseCase(): Promise<SelectLevelTopic[]> {
  try {
    // Obtener el usuario actual del store
    const { user } = useUserStore.getState();
    
    if (!user) {
      throw new Error('Usuario no autenticado. Debe iniciar sesión para obtener las selecciones.');
    }
    
    // Obtener todas las selecciones del usuario
    const userSelections = await SupabaseSelectLevelTopicAdapter.getUserSelections(user.id);
    
    return userSelections;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? `Error al obtener las selecciones del usuario: ${error.message}`
      : 'Error desconocido al obtener las selecciones del usuario';
    
    console.error('Error en getUserSelectLevelTopicUseCase:', error);
    throw new Error(errorMessage);
  }
}