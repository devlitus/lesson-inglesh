import { useUserStore } from '../../infrastructure/store/userStore';
import { SupabaseUserAdapter } from '../../infrastructure/adapters/SupabaseUserAdapter';
import { supabase } from '../../shared/config/supabaseClient';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Initialize authentication by checking if user is already authenticated
 * and setting the appropriate state in the user store
 */
export const initializeAuthUseCase = async (): Promise<void> => {
  const { setLoading, setUser } = useUserStore.getState();
  
  try {
    setLoading(true);
    
    // Check if user is already authenticated
    const currentUser = await SupabaseUserAdapter.getCurrentUser();
    
    if (currentUser) {
      setUser(currentUser);
      
      // Setup auth state change listener when user exists
      supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        switch (event) {
          case 'SIGNED_IN':
             if (session?.user) {
               const user = {
                 id: session.user.id,
                 name: session.user.user_metadata?.name || (session.user.email ? session.user.email.split('@')[0] : 'Usuario'),
                 email: session.user.email || ''
               };
               setUser(user);
             }
             break;
          case 'SIGNED_OUT':
            setUser(null);
            break;
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token de autenticación renovado');
            break;
        }
      });
    } else {
      setUser(null);
    }
  } catch (error) {
    console.error('❌ Error al inicializar autenticación:', error);
    setUser(null);
    
    // Don't throw error for initialization - just log it
    // The app should still work even if auth initialization fails
  } finally {
    setLoading(false);
  }
};