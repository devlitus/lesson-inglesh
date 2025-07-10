export const AuthErrorType = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type AuthErrorType = typeof AuthErrorType[keyof typeof AuthErrorType];

export class AuthError extends Error {
  public readonly type: AuthErrorType;
  public readonly originalError?: Error;

  constructor(type: AuthErrorType, message: string, originalError?: Error | { message?: string }) {
    super(message);
    this.type = type;
    this.originalError = originalError instanceof Error ? originalError : undefined;
    this.name = 'AuthError';
  }

  static fromSupabaseError(error: Error | { message?: string }): AuthError {
    if (error.message?.includes('Invalid login credentials')) {
      return new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Credenciales inválidas', error);
    }
    if (error.message?.includes('User not found')) {
      return new AuthError(AuthErrorType.USER_NOT_FOUND, 'Usuario no encontrado', error);
    }
    if (error.message?.includes('Network')) {
      return new AuthError(AuthErrorType.NETWORK_ERROR, 'Error de conexión', error);
    }
    return new AuthError(AuthErrorType.UNKNOWN_ERROR, error.message || 'Error desconocido', error);
  }
}