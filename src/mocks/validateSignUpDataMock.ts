import type { SignUpInput } from '../domain/schemas/AuthSchema';

export const validSignUpData: SignUpInput = {
  email: 'test@example.com',
  password: 'password123',
  confirmPassword: 'password123'
};