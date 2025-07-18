export enum UserErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class UserError extends Error {
  public readonly type: UserErrorType;
  public readonly originalError?: Error;

  constructor(type: UserErrorType, message: string, originalError?: Error) {
    super(message);
    this.name = 'UserError';
    this.type = type;
    this.originalError = originalError;

    // Mantener el stack trace en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserError);
    }
  }

  static fromError(error: Error, type: UserErrorType = UserErrorType.UNKNOWN_ERROR): UserError {
    if (error instanceof UserError) {
      return error;
    }
    return new UserError(type, error.message, error);
  }
}