import { SupabaseAuthAdapter } from '../../infrastructure/adapters/SupabaseAuthAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';
import { supabase } from '../../shared/config/supabaseClient';

export async function initializeAuthUseCase(): Promise<void> {
  try {
    // Establecer estado de carga
    useUserStore.getState().setLoading(true);
    
    // Verificar si hay una sesión activa
    const user = await SupabaseAuthAdapter.getCurrentUser();
    
    // Actualizar el store con el usuario actual (o null)
    useUserStore.getState().setUser(user);
    
    // Configurar listener para cambios de autenticación
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
          email: session.user.email!
        };
        useUserStore.getState().setUser(user);
      } else if (event === 'SIGNED_OUT') {
        useUserStore.getState().setUser(null);
      }
    });
  } catch (error) {
    console.error('Error al inicializar autenticación:', error);
    // En caso de error, asumimos que no hay usuario autenticado
    useUserStore.getState().setUser(null);
  } finally {
    // Quitar estado de carga
    useUserStore.getState().setLoading(false);
  }
}