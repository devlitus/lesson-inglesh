import { z } from 'zod';
import { UserError, UserErrorType } from '../../domain/entities/UserError';
import { SupabaseUserAdapter } from '../../infrastructure/adapters/SupabaseUserAdapter';
import { useUserStore } from '../../infrastructure/store/userStore';
import type { User } from '../../domain/entities/User';

const UpdateUserSchema = z.object({
  id: z.string().min(1, 'ID de usuario requerido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional()
}).refine(data => data.name !== undefined || data.email !== undefined, {
  message: 'Debe proporcionar al menos un campo para actualizar'
});

export async function updateUserUseCase(input: unknown): Promise<User> {
  // Validación con Zod
  const result = UpdateUserSchema.safeParse(input);
  if (!result.success) {
    throw new UserError(
      UserErrorType.VALIDATION_ERROR,
      'Datos de entrada inválidos: ' + result.error.issues.map(e => e.message).join(', ')
    );
  }

  const { id, ...updates } = result.data;

  try {
    // Actualizar usuario
    const updatedUser = await SupabaseUserAdapter.updateUser(id, updates);
    
    // Si el usuario actualizado es el usuario actual, actualizar el store
    const currentUser = useUserStore.getState().user;
    if (currentUser && currentUser.id === id) {
      useUserStore.getState().setUser(updatedUser);
    }
    
    return updatedUser;
  } catch (error) {
    if (error instanceof UserError) {
      throw error;
    }
    throw new UserError(
      UserErrorType.UNKNOWN_ERROR,
      error instanceof Error ? error.message : 'Error desconocido al actualizar usuario'
    );
  }
}