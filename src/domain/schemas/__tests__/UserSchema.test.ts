import { describe, test, expect } from 'vitest';
import { SignInSchema, SignUpSchema } from '../UserSchema';

describe('UserSchema', () => {
  describe('SignInSchema', () => {
    describe('Validación exitosa', () => {
      test('valida correctamente datos de login válidos', () => {
        const validData = {
          email: 'usuario@ejemplo.com',
          password: 'password123'
        };

        const result = SignInSchema.safeParse(validData);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });
    });

    describe('Validación de email', () => {
      test('rechaza email inválido', () => {
        const invalidData = {
          email: 'email-invalido',
          password: 'password123'
        };

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email inválido');
        }
      });

      test('rechaza email vacío', () => {
        const invalidData = {
          email: '',
          password: 'password123'
        };

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });
    });

    describe('Validación de contraseña', () => {
      test('rechaza contraseña muy corta', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com',
          password: '123'
        };

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 6 caracteres');
        }
      });

      test('rechaza contraseña vacía', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com',
          password: ''
        };

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });
    });
  });

  describe('SignUpSchema', () => {
    describe('Validación exitosa', () => {
      test('valida correctamente datos de registro válidos', () => {
        const validData = {
          name: 'Usuario Nuevo',
          email: 'nuevo@ejemplo.com',
          password: 'password123'
        };

        const result = SignUpSchema.safeParse(validData);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });
    });

    describe('Validación de nombre', () => {
      test('rechaza nombre muy corto', () => {
        const invalidData = {
          name: 'A',
          email: 'nuevo@ejemplo.com',
          password: 'password123'
        };

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre debe tener al menos 2 caracteres');
        }
      });

      test('rechaza nombre vacío', () => {
        const invalidData = {
          name: '',
          email: 'nuevo@ejemplo.com',
          password: 'password123'
        };

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });
    });

    describe('Validación de email', () => {
      test('rechaza email inválido', () => {
        const invalidData = {
          name: 'Usuario Nuevo',
          email: 'email-invalido',
          password: 'password123'
        };

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email inválido');
        }
      });
    });

    describe('Validación de contraseña', () => {
      test('rechaza contraseña muy corta', () => {
        const invalidData = {
          name: 'Usuario Nuevo',
          email: 'nuevo@ejemplo.com',
          password: '123'
        };

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 6 caracteres');
        }
      });
    });
  });
});