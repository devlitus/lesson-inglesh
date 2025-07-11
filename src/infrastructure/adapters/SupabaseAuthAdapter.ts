import { supabase } from '../../shared/config/supabaseClient';
import type { User } from '../../domain/entities/User';
import { AuthError, AuthErrorType } from '../../domain/entities/AuthError';
import type { SignInInput, SignUpInput } from '../../domain/schemas/AuthSchema';

export const SupabaseAuthAdapter = {
  async signIn({ email, password }: SignInInput): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        throw AuthError.fromSupabaseError(error);
      }
      
      if (!data.user) {
        throw new AuthError(
          AuthErrorType.UNKNOWN_ERROR,
          'No se pudo obtener la información del usuario'
        );
      }
      
      return {
        id: data.user.id,
        name: data.user.user_metadata?.name,
        email: data.user.email!
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw AuthError.fromSupabaseError(error as Error);
    }
  },

  async signUp({ email, password }: SignUpInput): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) {
        throw AuthError.fromSupabaseError(error);
      }
      
      if (!data.user) {
        throw new AuthError(
          AuthErrorType.UNKNOWN_ERROR,
          'No se pudo crear el usuario'
        );
      }
      
      return {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario',
        email: data.user.email!
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw AuthError.fromSupabaseError(error as Error);
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw AuthError.fromSupabaseError(error);
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw AuthError.fromSupabaseError(error as Error);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // Primero verificar si hay una sesión activa
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Si no hay sesión, retornar null sin error
      if (!session) {
        return null;
      }

      // Si hay sesión, obtener los datos del usuario
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        // Si el error es de sesión faltante, retornar null en lugar de lanzar error
        if (
          error.message?.includes("Auth session missing") ||
          error.message?.includes("session_not_found")
        ) {
          return null;
        }
        throw AuthError.fromSupabaseError(error);
      }

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name:
          user.user_metadata?.name || user.email?.split("@")[0] || "Usuario",
        email: user.email!,
      };
    } catch (error) {
      // Manejo especial para errores de sesión
      if (
        error instanceof Error &&
        (error.message?.includes("Auth session missing") ||
          error.message?.includes("session_not_found") ||
          error.message?.includes("Invalid JWT"))
      ) {
        return null;
      }

      if (error instanceof AuthError) {
        throw error;
      }
      throw AuthError.fromSupabaseError(error as Error);
    }
  }
};