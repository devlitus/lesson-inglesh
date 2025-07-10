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
  } catch (error) {
    // En caso de error, aún así limpiamos el estado local
    useUserStore.getState().logout();
    throw error;
  } finally {
    // Quitar estado de carga
    useUserStore.getState().setLoading(false);
  }
}