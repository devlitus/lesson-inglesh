import { SupabaseAuthAdapter } from '../../infrastructure/adapters/SupabaseAuthAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';

export async function logoutUseCase(): Promise<void> {
  try {
    // Establecer estado de carga
    useUserStore.getState().setLoading(true);
    
    // Cerrar sesión en Supabase
    await SupabaseAuthAdapter.signOut();
    
    // Limpiar el store global
    useUserStore.getState().logout();
    
    // Limpiar todo el localStorage
    localStorage.clear();
  } catch (error) {
    // En caso de error, aún así limpiamos el estado local y localStorage
    useUserStore.getState().logout();
    localStorage.clear();
    throw error;
  } finally {
    // Quitar estado de carga
    useUserStore.getState().setLoading(false);
  }
}