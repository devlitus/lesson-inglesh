import { SupabaseAuthAdapter } from '../../infrastructure/adapters/SupabaseAuthAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';
import { useSelectionStore } from '../../infrastructure/store/selectionStore';

export async function logoutUseCase(): Promise<void> {
  try {
    // Establecer estado de carga
    useUserStore.getState().setLoading(true);
    
    // Cerrar sesión en Supabase
    await SupabaseAuthAdapter.signOut();
    
    // Limpiar todos los stores
    useUserStore.getState().logout();
    useSelectionStore.getState().clearSelection();
    
    // SEGURIDAD: Limpiar completamente localStorage para eliminar cualquier dato sensible
    localStorage.clear();
    
  } catch (error) {
    // En caso de error, aún así limpiamos el estado local por seguridad
    useUserStore.getState().logout();
    useSelectionStore.getState().clearSelection();
    localStorage.clear(); // Limpieza de seguridad incluso en error
    throw error;
  } finally {
    // Quitar estado de carga
    useUserStore.getState().setLoading(false);
  }
}