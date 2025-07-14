import { useUserStore } from '../../infrastructure/store/userStore';

export async function logoutUserUseCase(): Promise<void> {
  try {
    // Establecer estado de carga
    useUserStore.getState().setLoading(true);
    
    // Limpiar el estado del usuario
    useUserStore.getState().logout();
  } finally {
    // Siempre limpiar el estado de carga
    useUserStore.getState().setLoading(false);
  }
}