/**
 * Tests para el componente FormField
 * Componente crítico que combina Label, Input y manejo de errores
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FormField } from '../FormField/FormField';

describe('FormField', () => {
  describe('Renderizado básico', () => {
    it('renderiza correctamente con props mínimas', () => {
      render(<FormField name="test" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('name', 'test');
    });

    it('renderiza con etiqueta cuando se proporciona', () => {
      render(<FormField name="test" label="Campo de prueba" />);
      
      const label = screen.getByText('Campo de prueba');
      const input = screen.getByRole('textbox');
      
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', input.id);
    });

    it('renderiza descripción cuando se proporciona', () => {
      const description = 'Esta es una descripción de ayuda';
      render(
        <FormField 
          name="test" 
          label="Campo" 
          description={description} 
        />
      );
      
      expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('renderiza mensaje de error cuando se proporciona', () => {
      const error = 'Este campo es requerido';
      render(
        <FormField 
          name="test" 
          label="Campo" 
          error={error} 
        />
      );
      
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });

  describe('Accesibilidad', () => {
    it('asocia correctamente la etiqueta con el input', () => {
      render(<FormField name="test" label="Campo de prueba" />);
      
      const label = screen.getByText('Campo de prueba');
      const input = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for', input.id);
      expect(input).toHaveAttribute('id');
    });

    it('configura aria-describedby correctamente con descripción', () => {
      render(
        <FormField 
          name="test" 
          label="Campo" 
          description="Descripción de ayuda" 
        />
      );
      
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy!)).toHaveTextContent('Descripción de ayuda');
    });

    it('configura aria-describedby correctamente con error', () => {
      render(
        <FormField 
          name="test" 
          label="Campo" 
          error="Error de validación" 
        />
      );
      
      const input = screen.getByRole('textbox');
      const errorElement = screen.getByText('Error de validación');
      
      expect(input).toHaveAttribute('aria-describedby');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveAttribute('role', 'alert');
    });

    it('marca el campo como requerido cuando required es true', () => {
      render(<FormField name="test" label="Campo" required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
      
      // Verifica que la etiqueta muestre el asterisco de requerido
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Validación', () => {
    it('ejecuta validación personalizada en blur por defecto', async () => {
      const validate = vi.fn((value: string) => {
        if (value.length < 3) return 'Mínimo 3 caracteres';
      });

      render(
        <FormField 
          name="test" 
          label="Campo" 
          validate={validate} 
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'ab');
      await userEvent.tab(); // Trigger blur
      
      expect(validate).toHaveBeenCalledWith('ab');
      await waitFor(() => {
        expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument();
      });
    });

    it('ejecuta validación en tiempo real cuando validateOnChange es true', async () => {
      const validate = vi.fn((value: string) => {
        if (value.length < 3) return 'Mínimo 3 caracteres';
      });

      render(
        <FormField 
          name="test" 
          label="Campo" 
          validate={validate}
          validateOnChange
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'a');
      
      await waitFor(() => {
        expect(validate).toHaveBeenCalledWith('a');
      });
    });

    it('no ejecuta validación en blur cuando validateOnBlur es false', async () => {
      const validate = vi.fn((value: string) => {
        if (value.length < 3) return 'Mínimo 3 caracteres';
      });

      render(
        <FormField 
          name="test" 
          label="Campo" 
          validate={validate}
          validateOnBlur={false}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.type(input, 'ab');
      await userEvent.tab(); // Trigger blur
      
      expect(validate).not.toHaveBeenCalled();
      expect(screen.queryByText('Mínimo 3 caracteres')).not.toBeInTheDocument();
    });

    it('prioriza error externo sobre error de validación interna', async () => {
      const validate = vi.fn(() => 'Error interno');
      const externalError = 'Error externo';

      render(
        <FormField 
          name="test" 
          label="Campo" 
          validate={validate}
          error={externalError}
        />
      );
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');
      await userEvent.tab();
      
      expect(screen.getByText(externalError)).toBeInTheDocument();
      expect(screen.queryByText('Error interno')).not.toBeInTheDocument();
    });

    it('valida valor por defecto si se proporciona', () => {
      const validate = vi.fn((value: string) => {
        if (value === 'invalid') return 'Valor inválido';
      });

      render(
        <FormField 
          name="test" 
          label="Campo" 
          validate={validate}
          defaultValue="invalid"
        />
      );
      
      expect(validate).toHaveBeenCalledWith('invalid');
    });
  });

  describe('Eventos', () => {
    it('llama a onChange cuando el usuario escribe', async () => {
      const onChange = vi.fn();
      
      render(
        <FormField 
          name="test" 
          label="Campo" 
          onChange={onChange} 
        />
      );
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');
      
      expect(onChange).toHaveBeenCalledTimes(4); // Una vez por cada carácter
    });

    it('llama a onBlur cuando el campo pierde el foco', async () => {
      const onBlur = vi.fn();
      
      render(
        <FormField 
          name="test" 
          label="Campo" 
          onBlur={onBlur} 
        />
      );
      
      const input = screen.getByRole('textbox');
      await userEvent.click(input);
      await userEvent.tab();
      
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props del contenedor', () => {
    it('aplica props del contenedor correctamente', () => {
      render(
        <FormField 
          name="test" 
          label="Campo" 
          containerProps={{
            'data-testid': 'form-field-container',
            className: 'custom-class'
          }}
        />
      );
      
      const container = screen.getByTestId('form-field-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('custom-class', 'space-y-1');
    });
  });

  describe('Props de la etiqueta', () => {
    it('aplica props de la etiqueta correctamente', () => {
      render(
        <FormField 
          name="test" 
          label="Campo" 
          labelProps={{
            className: 'custom-label-class'
          }}
        />
      );
      
      const label = screen.getByText('Campo');
      expect(label).toHaveClass('custom-label-class');
    });
  });

  describe('Reenvío de referencia', () => {
    it('reenvía la referencia al input correctamente', () => {
      const ref = React.createRef<HTMLInputElement>();
      
      render(<FormField ref={ref} name="test" label="Campo" />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toBe(screen.getByRole('textbox'));
    });
  });

  describe('Tipos de input', () => {
    it('soporta diferentes tipos de input', () => {
      const { rerender } = render(
        <FormField name="email" label="Email" type="email" />
      );
      
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
      
      rerender(<FormField name="password" label="Password" type="password" />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });
  });

  describe('Estados del input', () => {
    it('soporta estado deshabilitado', () => {
      render(<FormField name="test" label="Campo" disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('soporta estado de solo lectura', () => {
      render(<FormField name="test" label="Campo" readOnly />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });
});