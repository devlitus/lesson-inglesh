import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseUserAdapter } from '../SupabaseUserAdapter';
import { UserError, UserErrorType } from '../../../domain/entities/UserError';
import type { SignInInput, SignUpInput, User } from '../../../domain/entities/User';

// Mock de supabase
vi.mock('../../../shared/config/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

import { supabase } from '../../../shared/config/supabaseClient';

describe('SupabaseUserAdapter', () => {
  // Mocks para las operaciones de base de datos
  const mockFrom = vi.fn();
  const mockSingle = vi.fn();
  const mockRpc = vi.fn();

  // Datos de prueba
  const mockSignInInput: SignInInput = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockSignUpInput: SignUpInput = {
    name: 'Test User',
    email: 'newuser@example.com',
    password: 'newpassword123',
  };

  const mockUserData = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
  };

  const mockUser: User = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Configurar cadena de mocks para supabase
    const createMockChain = () => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    });

    const mockChain = createMockChain();
    
    mockChain.select.mockReturnValue(mockChain);
    mockChain.insert.mockReturnValue(mockChain);
    mockChain.update.mockReturnValue(mockChain);
    mockChain.delete.mockReturnValue(mockChain);
    mockChain.eq.mockReturnValue(mockChain);

    mockFrom.mockReturnValue(mockChain);
    (supabase.from as any) = mockFrom;
    (supabase.rpc as any) = mockRpc;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    test('should sign in successfully with valid credentials', async () => {
      // Arrange
      mockSingle.mockResolvedValueOnce({
        data: mockUserData,
        error: null,
      });
      
      // Mock para verificación de contraseña
      mockRpc.mockResolvedValueOnce({
        data: 'hashed-password',
        error: null,
      });

      // Act
      const result = await SupabaseUserAdapter.signIn(mockSignInInput);

      // Assert
      expect(result).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    test('should throw error when user not found', async () => {
      // Arrange
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Act & Assert
      await expect(SupabaseUserAdapter.signIn(mockSignInInput))
        .rejects.toThrow(new UserError(UserErrorType.INVALID_CREDENTIALS, 'Credenciales inválidas'));
    });

    test('should throw error when password is invalid', async () => {
      // Arrange
      mockSingle.mockResolvedValueOnce({
        data: mockUserData,
        error: null,
      });
      
      // Mock para verificación de contraseña fallida
      mockRpc.mockResolvedValueOnce({
        data: 'different-hash',
        error: null,
      });

      // Act & Assert
      await expect(SupabaseUserAdapter.signIn(mockSignInInput))
        .rejects.toThrow(new UserError(UserErrorType.INVALID_CREDENTIALS, 'Credenciales inválidas'));
    });
  });

  describe('signUp', () => {
    test('should sign up successfully with valid data', async () => {
      // Arrange
      mockSingle
        .mockResolvedValueOnce({
          data: null, // Usuario no existe
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockUser,
          error: null,
        });
      
      // Mock para generar salt y hash
      mockRpc
        .mockResolvedValueOnce({ data: 'salt', error: null })
        .mockResolvedValueOnce({ data: 'hashed-password', error: null });

      // Act
      const result = await SupabaseUserAdapter.signUp(mockSignUpInput);

      // Assert
      expect(result).toEqual(mockUser);
    });

    test('should throw error when user already exists', async () => {
      // Arrange
      mockSingle.mockResolvedValueOnce({
        data: { id: 'existing-user' },
        error: null,
      });

      // Act & Assert
      await expect(SupabaseUserAdapter.signUp(mockSignUpInput))
        .rejects.toThrow(new UserError(UserErrorType.USER_ALREADY_EXISTS, 'El usuario ya existe con este email'));
    });
  });

  describe('getUserById', () => {
    test('should return user when found', async () => {
      // Arrange
      mockSingle.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      // Act
      const result = await SupabaseUserAdapter.getUserById('user-123');

      // Assert
      expect(result).toEqual(mockUser);
    });

    test('should return null when user not found', async () => {
      // Arrange
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      // Act
      const result = await SupabaseUserAdapter.getUserById('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    test('should update user successfully', async () => {
      // Arrange
      const updates = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      
      mockSingle.mockResolvedValueOnce({
        data: updatedUser,
        error: null,
      });

      // Act
      const result = await SupabaseUserAdapter.updateUser('user-123', updates);

      // Assert
      expect(result).toEqual(updatedUser);
    });

    test('should throw error when update fails', async () => {
      // Arrange
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      // Act & Assert
      await expect(SupabaseUserAdapter.updateUser('user-123', { name: 'New Name' }))
        .rejects.toThrow(new UserError(UserErrorType.UNKNOWN_ERROR, 'Error al actualizar el usuario: Update failed'));
    });
  });

  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      // Arrange
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      };
      mockFrom.mockReturnValue(mockChain);

      // Act
      await expect(SupabaseUserAdapter.deleteUser('user-123')).resolves.not.toThrow();
    });

    test('should throw error when delete fails', async () => {
      // Arrange
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
      };
      mockFrom.mockReturnValue(mockChain);

      // Act & Assert
      await expect(SupabaseUserAdapter.deleteUser('user-123'))
        .rejects.toThrow(new UserError(UserErrorType.UNKNOWN_ERROR, 'Error al eliminar el usuario: Delete failed'));
    });
  });
});