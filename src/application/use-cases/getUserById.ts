import { UserError, UserErrorType } from '../../domain/entities/UserError';
import { SupabaseUserAdapter } from '../../infrastructure/adapters/SupabaseUserAdapter';
import type { User } from '../../domain/entities/User';

export async function getUserByIdUseCase(id: string): Promise<User> {
  if (!id || typeof id !== 'string') {
    throw new UserError(
      UserErrorType.VALIDATION_ERROR,
      'ID de usuario inválido'
    );
  }

  try {
    const user = await SupabaseUserAdapter.getUserById(id);
    
    if (!user) {
      throw new UserError(
        UserErrorType.USER_NOT_FOUND,
        'Usuario no encontrado'
      );
    }
    
    return user;
  } catch (error) {
    if (error instanceof UserError) {
      throw error;
    }
    throw new UserError(
      UserErrorType.UNKNOWN_ERROR,
      error instanceof Error ? error.message : 'Error desconocido al obtener usuario'
    );
  }
}