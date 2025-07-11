import { SupabaseSelectLevelTopicAdapter } from '../../infrastructure/adapters/SupabaseSelectLevelTopicAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';
import type { SelectLevelTopic } from '../../domain/entities/SelectLevelTopic';

/**
 * Caso de uso para verificar si el usuario ya tiene una selecci?n de level y topic
 * Si tiene una selecci?n, devuelve true para indicar que debe redirigir a la p?gina de lecciones
 * @returns Promise<{ hasSelection: boolean; selection: SelectLevelTopic | null }>
 * @throws Error si no hay usuario autenticado o si falla la operaci?n
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
    console.error('Error en checkUserSelectionUseCase:', error);
    throw new Error(
      error instanceof Error 
        ? `Error al verificar selección del usuario: ${error.message}`
        : 'Error desconocido al verificar selección del usuario'
    );
  }
}

/**
 * Caso de uso simplificado que solo devuelve si el usuario tiene una selecci?n
 * @returns Promise<boolean> - true si el usuario tiene una selecci?n, false en caso contrario
 */
export async function hasUserSelectionUseCase(): Promise<boolean> {
  try {
    const result = await checkUserSelectionUseCase();
    return result.hasSelection;
  } catch (error) {
    // En caso de error, asumir que no tiene selecci?n para no bloquear la navegaci?n
    console.error('Error al verificar selecci?n del usuario:', error);
    return false;
  }
}