import { supabase } from '../../shared/config/supabaseClient';
import type { User, SignInInput, SignUpInput } from '../../domain/entities/User';
import { UserError, UserErrorType } from '../../domain/entities/UserError';

// Función para hashear contraseñas usando bcrypt de PostgreSQL
const hashPassword = async (password: string): Promise<string> => {
  // Usamos la función crypt de PostgreSQL con bcrypt
  const { data, error } = await supabase.rpc('crypt', {
    password,
    salt: await generateSalt()
  });
  
  if (error) {
    throw new UserError(UserErrorType.UNKNOWN_ERROR, 'Error al hashear la contraseña');
  }
  
  return data;
};

// Función para generar salt usando PostgreSQL
const generateSalt = async (): Promise<string> => {
  const { data, error } = await supabase.rpc('gen_salt', { type: 'bf' });
  
  if (error) {
    throw new UserError(UserErrorType.UNKNOWN_ERROR, 'Error al generar salt');
  }
  
  return data;
};

// Función para verificar contraseñas
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('crypt', {
    password,
    salt: hashedPassword
  });
  
  if (error) {
    return false;
  }
  
  return data === hashedPassword;
};

export class SupabaseUserAdapter {
  static async signIn({ email, password }: SignInInput): Promise<User> {
    try {
      // Buscar usuario en la tabla public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, password')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new UserError(
          UserErrorType.INVALID_CREDENTIALS,
          'Credenciales inválidas'
        );
      }

      // Verificar contraseña
      const isValidPassword = await verifyPassword(password, userData.password);
      if (!isValidPassword) {
        throw new UserError(
          UserErrorType.INVALID_CREDENTIALS,
          'Credenciales inválidas'
        );
      }

      // Retornar usuario sin la contraseña
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email
      };
    } catch (error) {
      if (error instanceof UserError) {
        throw error;
      }
      throw new UserError(
        UserErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Error desconocido al iniciar sesión'
      );
    }
  }

  static async signUp({ name, email, password }: SignUpInput): Promise<User> {
    try {
      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new UserError(
          UserErrorType.USER_ALREADY_EXISTS,
          'El usuario ya existe con este email'
        );
      }

      // Hashear la contraseña
      const hashedPassword = await hashPassword(password);

      // Crear el usuario
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password: hashedPassword
        })
        .select('id, name, email')
        .single();

      if (createError || !newUser) {
        throw new UserError(
          UserErrorType.UNKNOWN_ERROR,
          'Error al crear el usuario: ' + (createError?.message || 'Error desconocido')
        );
      }

      return newUser;
    } catch (error) {
      if (error instanceof UserError) {
        throw error;
      }
      throw new UserError(
        UserErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Error desconocido al registrar usuario'
      );
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', id)
        .single();

      if (error || !userData) {
        return null;
      }

      return userData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('email', email)
        .single();

      if (error || !userData) {
        return null;
      }

      return userData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async updateUser(id: string, updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select('id, name, email')
        .single();

      if (error || !updatedUser) {
        throw new UserError(
          UserErrorType.UNKNOWN_ERROR,
          'Error al actualizar el usuario: ' + (error?.message || 'Error desconocido')
        );
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

  static async deleteUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new UserError(
          UserErrorType.UNKNOWN_ERROR,
          'Error al eliminar el usuario: ' + error.message
        );
      }
    } catch (error) {
      if (error instanceof UserError) {
        throw error;
      }
      throw new UserError(
        UserErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Error desconocido al eliminar usuario'
      );
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      // Convert Supabase user to our User type
      return {
        id: user.id,
        name: user.user_metadata?.name || user.email || '',
        email: user.email || ''
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}