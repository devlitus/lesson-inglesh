import { SignInSchema } from '../../domain/schemas/AuthSchema';
import { AuthError, AuthErrorType } from '../../domain/entities/AuthError';
import { SupabaseAuthAdapter } from '../../infrastructure/adapters/SupabaseAuthAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';

export async function signInUseCase(input: unknown): Promise<void> {
  // Validación con Zod
  const result = SignInSchema.safeParse(input);
  if (!result.success) {
    throw new AuthError(
      AuthErrorType.VALIDATION_ERROR,
      'Datos de entrada inválidos: ' + result.error.issues.map(e => e.message).join(', ')
    );
  }

  try {
    // Establecer estado de carga
    useUserStore.getState().setLoading(true);
    
    // Autenticar con Supabase
    const user = await SupabaseAuthAdapter.signIn(result.data);
    
    // Actualizar el store global
    useUserStore.getState().setUser(user);
  } catch (error) {
    // Limpiar el estado en caso de error
    useUserStore.getState().setUser(null);
    throw error;
  } finally {
    // Quitar estado de carga
    useUserStore.getState().setLoading(false);
  }
}