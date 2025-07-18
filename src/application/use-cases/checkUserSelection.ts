import { SupabaseSelectLevelTopicAdapter } from '../../infrastructure/adapters/SupabaseSelectLevelTopicAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';
import type { SelectLevelTopic } from '../../domain/entities/SelectLevelTopic';

/**
 * Caso de uso para verificar si el usuario ya tiene una selección de level y topic
 * Si tiene una selección, devuelve true para indicar que debe redirigir a la página de lecciones
 * @returns Promise<{ hasSelection: boolean; selection: SelectLevelTopic | null }>
 * @throws Error si no hay usuario autenticado o si falla la operación
 */
export async function checkUserSelectionUseCase(): Promise<{
  hasSelection: boolean;
  selection: SelectLevelTopic | null;
}> {
  try {
    // Verificar que hay un usuario autenticado
    const { user } = useUserStore.getState();
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Obtener la última selección del usuario
    const selection = await SupabaseSelectLevelTopicAdapter.getLastSelection(user.id);
    
    return {
      hasSelection: selection !== null,
      selection
    };
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Error al verificar selección del usuario: ${error.message}`
        : 'Error desconocido al verificar selección del usuario'
    );
  }
}

/**
 * Caso de uso simplificado que solo devuelve si el usuario tiene una selección
 * @returns Promise<boolean> - true si el usuario tiene una selección, false en caso contrario
 */
export async function hasUserSelectionUseCase(): Promise<boolean> {
  try {
    const result = await checkUserSelectionUseCase();
    return result.hasSelection;
  } catch (error) {
    // En caso de error, asumir que no tiene selección para no bloquear la navegación
    console.error('Error al verificar selección del usuario:', error);
    return false;
  }
}