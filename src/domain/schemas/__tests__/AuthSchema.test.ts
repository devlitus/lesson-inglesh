/**
 * Tests para esquemas de validación de autenticación
 * Tests críticos para validación de datos con Zod
 */

import { describe, it, expect } from 'vitest';
import { SignInSchema, SignUpSchema, type SignInInput, type SignUpInput } from '../AuthSchema';

describe('AuthSchema Validation', () => {
  describe('SignInSchema', () => {
    describe('Validación exitosa', () => {
      it('valida correctamente datos de login válidos', () => {
        const validData = {
          email: 'usuario@ejemplo.com',
          password: 'password123'
        };

        const result = SignInSchema.safeParse(validData);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
          expect(result.data.email).toBe('usuario@ejemplo.com');
          expect(result.data.password).toBe('password123');
        }
      });

      it('acepta contraseñas de exactamente 6 caracteres', () => {
        const validData = {
          email: 'test@test.com',
          password: '123456'
        };

        const result = SignInSchema.safeParse(validData);
        
        expect(result.success).toBe(true);
      });

      it('acepta emails con diferentes formatos válidos', () => {
        const testCases = [
          'simple@example.com',
          'user.name@example.com',
          'user+tag@example.co.uk',
          'user123@example-domain.com'
        ];

        testCases.forEach(email => {
          const result = SignInSchema.safeParse({
            email,
            password: 'password123'
          });
          
          expect(result.success).toBe(true);
        });
      });
    });

    describe('Validación de email', () => {
      it('rechaza email con formato inválido', () => {
        const invalidData = {
          email: 'email-invalido',
          password: 'password123'
        };

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toEqual(['email']);
          expect(result.error.issues[0].message).toBe('Email inválido');
        }
      });

      it('rechaza email vacío', () => {
        const invalidData = {
          email: '',
          password: 'password123'
        };

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toEqual(['email']);
          expect(result.error.issues[0].message).toBe('Email inválido');
        }
      });

      it('rechaza emails sin dominio', () => {
        const invalidEmails = [
          'usuario@',
          '@ejemplo.com',
          'usuario',
          'usuario@.com'
        ];

        invalidEmails.forEach(email => {
          const result = SignInSchema.safeParse({
            email,
            password: 'password123'
          });
          
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Validación de contraseña', () => {
      it('rechaza contraseña menor a 6 caracteres', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com',
          password: '12345'
        };

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toEqual(['password']);
          expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 6 caracteres');
        }
      });

      it('rechaza contraseña vacía', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com',
          password: ''
        };

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toEqual(['password']);
          expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 6 caracteres');
        }
      });
    });

    describe('Validación de campos faltantes', () => {
      it('rechaza objeto sin email', () => {
        const invalidData = {
          password: 'password123'
        } as Partial<{ email: string; password: string }>;

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          const emailError = result.error.issues.find(issue => issue.path[0] === 'email');
          expect(emailError).toBeDefined();
        }
      });

      it('rechaza objeto sin password', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com'
        } as Partial<{ email: string; password: string }>;

        const result = SignInSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.issues.find(issue => issue.path[0] === 'password');
          expect(passwordError).toBeDefined();
        }
      });
    });
  });

  describe('SignUpSchema', () => {
    describe('Validación exitosa', () => {
      it('valida correctamente datos de registro válidos', () => {
        const validData = {
          email: 'nuevo@ejemplo.com',
          password: 'password123',
          confirmPassword: 'password123'
        };

        const result = SignUpSchema.safeParse(validData);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('acepta contraseñas largas que coinciden', () => {
        const validData = {
          email: 'test@test.com',
          password: 'contraseña-muy-larga-y-segura-123',
          confirmPassword: 'contraseña-muy-larga-y-segura-123'
        };

        const result = SignUpSchema.safeParse(validData);
        
        expect(result.success).toBe(true);
      });
    });

    describe('Validación de confirmación de contraseña', () => {
      it('rechaza cuando las contraseñas no coinciden', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com',
          password: 'password123',
          confirmPassword: 'password456'
        };

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toEqual(['confirmPassword']);
          expect(result.error.issues[0].message).toBe('Las contraseñas no coinciden');
        }
      });

      it('rechaza cuando confirmPassword está vacío pero password no', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com',
          password: 'password123',
          confirmPassword: ''
        };

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('valida que ambas contraseñas cumplan la longitud mínima', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com',
          password: '123',
          confirmPassword: '123'
        };

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordErrors = result.error.issues.filter(
            issue => issue.path[0] === 'password' || issue.path[0] === 'confirmPassword'
          );
          expect(passwordErrors.length).toBeGreaterThan(0);
        }
      });
    });

    describe('Herencia de validaciones de SignIn', () => {
      it('aplica las mismas validaciones de email que SignInSchema', () => {
        const invalidData = {
          email: 'email-invalido',
          password: 'password123',
          confirmPassword: 'password123'
        };

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toEqual(['email']);
          expect(result.error.issues[0].message).toBe('Email inválido');
        }
      });

      it('aplica las mismas validaciones de password que SignInSchema', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com',
          password: '123',
          confirmPassword: '123'
        };

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.issues.find(issue => 
            issue.path[0] === 'password' && 
            issue.message === 'La contraseña debe tener al menos 6 caracteres'
          );
          expect(passwordError).toBeDefined();
        }
      });
    });

    describe('Campos requeridos', () => {
      it('rechaza objeto sin confirmPassword', () => {
        const invalidData = {
          email: 'usuario@ejemplo.com',
          password: 'password123'
        } as Partial<{ email: string; password: string; confirmPassword: string }>;

        const result = SignUpSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          const confirmPasswordError = result.error.issues.find(
            issue => issue.path[0] === 'confirmPassword'
          );
          expect(confirmPasswordError).toBeDefined();
        }
      });
    });
  });

  describe('TypeScript Types', () => {
    it('genera tipos correctos para SignInInput', () => {
      // Test de compilación - si esto compila, los tipos son correctos
      const signInData: SignInInput = {
        email: 'test@test.com',
        password: 'password123'
      };

      expect(signInData.email).toBe('test@test.com');
      expect(signInData.password).toBe('password123');
    });

    it('genera tipos correctos para SignUpInput', () => {
      // Test de compilación - si esto compila, los tipos son correctos
      const signUpData: SignUpInput = {
        email: 'test@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      expect(signUpData.email).toBe('test@test.com');
      expect(signUpData.password).toBe('password123');
      expect(signUpData.confirmPassword).toBe('password123');
    });
  });
});