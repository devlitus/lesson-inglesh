import { SignInSchema } from '../../domain/schemas/UserSchema';
import { UserError, UserErrorType } from '../../domain/entities/UserError';
import { SupabaseUserAdapter } from '../../infrastructure/adapters/SupabaseUserAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';

export async function signInUserUseCase(input: unknown): Promise<void> {
  // Validación con Zod
  const result = SignInSchema.safeParse(input);
  if (!result.success) {
    throw new UserError(
      UserErrorType.VALIDATION_ERROR,
      'Datos de entrada inválidos: ' + result.error.issues.map(e => e.message).join(', ')
    );
  }

  try {
    // Establecer estado de carga
    useUserStore.getState().setLoading(true);
    
    // Limpiar estado previo
    useUserStore.getState().setUser(null);
    
    // Intentar iniciar sesión
    const user = await SupabaseUserAdapter.signIn(result.data);
    
    // Actualizar el store con el usuario autenticado
    useUserStore.getState().setUser(user);
  } catch (error) {
    // Limpiar estado en caso de error
    useUserStore.getState().setUser(null);
    throw error;
  } finally {
    // Siempre limpiar el estado de carga
    useUserStore.getState().setLoading(false);
  }
}