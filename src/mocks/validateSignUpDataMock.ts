import type { SignUpInput } from '../domain/schemas/UserSchema';

export const validSignUpData: SignUpInput = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};