/**
 * Input Component Tests
 * Tests críticos para el componente Input según TESTING_STRATEGY.md
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input/Input';

describe('Input Component - Critical Tests', () => {
  // Test básico de renderizado
  test('should render input with label', () => {
    render(<Input label="Email" />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  // Test de accesibilidad - asociación label-input
  test('should associate label with input correctly', () => {
    render(<Input label="Username" id="username-input" />);
    
    const input = screen.getByLabelText(/username/i);
    const label = screen.getByText('Username');
    
    expect(input).toHaveAttribute('id', 'username-input');
    expect(label).toHaveAttribute('for', 'username-input');
  });

  // Test de generación automática de ID
  test('should generate ID when not provided', () => {
    render(<Input label="Test Input" />);
    const input = screen.getByLabelText(/test input/i);
    const inputId = input.getAttribute('id');
    const label = screen.getByText('Test Input');
    
    expect(inputId).toBeTruthy();
    expect(label).toHaveAttribute('for', inputId!);
  });

  // Test de variantes
  test('should apply correct variant classes', () => {
    const { rerender } = render(<Input label="Test" variant="default" />);
    const input = screen.getByLabelText(/test/i);
    
    expect(input).toHaveClass('bg-white', 'border', 'border-gray-300', 'rounded-md');
    
    rerender(<Input label="Test" variant="filled" />);
    expect(input).toHaveClass('bg-gray-50', 'border-transparent');
    
    rerender(<Input label="Test" variant="flushed" />);
    expect(input).toHaveClass('bg-transparent', 'border-0', 'border-b-2');
  });

  // Test de tamaños
  test('should apply correct size classes', () => {
    const { rerender } = render(<Input label="Test" size="sm" />);
    const input = screen.getByLabelText(/test/i);
    
    expect(input).toHaveClass('h-8', 'px-3', 'text-sm');
    
    rerender(<Input label="Test" size="lg" />);
    expect(input).toHaveClass('h-12', 'px-4', 'text-base');
  });

  // Test de estado de error
  test('should display error message and apply error styles', () => {
    const errorMessage = 'This field is required';
    render(<Input label="Email" error={errorMessage} />);
    
    const input = screen.getByLabelText(/email/i);
    const errorElement = screen.getByText(errorMessage);
    
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass('text-red-600');
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('error'));
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  // Test de texto de ayuda
  test('should display helper text', () => {
    const helperText = 'Enter your email address';
    render(<Input label="Email" helperText={helperText} />);
    
    const input = screen.getByLabelText(/email/i);
    const helperElement = screen.getByText(helperText);
    
    expect(helperElement).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('helper'));
  });

  // Test de estado disabled
  test('should be disabled when disabled prop is true', () => {
    render(<Input label="Email" disabled />);
    const input = screen.getByLabelText(/email/i);
    
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:bg-gray-50', 'disabled:text-gray-500');
  });

  // Test de estado loading
  test('should show loading state and be disabled', () => {
    render(<Input label="Email" loading />);
    const input = screen.getByLabelText(/email/i);
    
    expect(input).toBeDisabled();
    // El spinner debería estar presente
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  // Test de iconos
  test('should render with left and right icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">@</span>;
    const RightIcon = () => <span data-testid="right-icon">✓</span>;
    
    render(
      <Input 
        label="Email" 
        leftIcon={<LeftIcon />} 
        rightIcon={<RightIcon />}
      />
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  // Test de entrada de usuario
  test('should handle user input correctly', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Input label="Email" onChange={handleChange} />);
    const input = screen.getByLabelText(/email/i);
    
    await user.type(input, 'test@example.com');
    
    expect(input).toHaveValue('test@example.com');
    expect(handleChange).toHaveBeenCalled();
  });

  // Test de eventos de focus y blur
  test('should handle focus and blur events', async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    
    render(<Input label="Email" onFocus={handleFocus} onBlur={handleBlur} />);
    const input = screen.getByLabelText(/email/i);
    
    await user.click(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  // Test de campo requerido
  test('should mark field as required', () => {
    render(<Input label="Email" required />);
    const input = screen.getByLabelText(/email/i);
    
    expect(input).toBeRequired();
    // Verificar que se muestra el asterisco de requerido
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  // Test de placeholder
  test('should display placeholder text', () => {
    const placeholder = 'Enter your email';
    render(<Input label="Email" placeholder={placeholder} />);
    const input = screen.getByLabelText(/email/i);
    
    expect(input).toHaveAttribute('placeholder', placeholder);
  });

  // Test de tipos de input
  test('should support different input types', () => {
    const { rerender } = render(<Input label="Email" type="email" />);
    const input = screen.getByLabelText(/email/i);
    
    expect(input).toHaveAttribute('type', 'email');
    
    rerender(<Input label="Password" type="password" />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // Test de ancho completo
  test('should apply full width when fullWidth is true', () => {
    render(<Input label="Email" fullWidth />);
    const input = screen.getByLabelText(/email/i);
    // El fullWidth se aplica al contenedor principal
    const mainContainer = input.closest('div')?.parentElement;
    
    expect(mainContainer).toHaveClass('w-full');
  });

  // Test de etiqueta oculta
  test('should hide label visually but keep it for screen readers', () => {
    render(<Input label="Email" hideLabel />);
    const label = screen.getByText('Email');
    
    expect(label).toHaveClass('sr-only');
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  // Test de forwarded ref
  test('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<Input label="Email" ref={ref} />);
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  // Test de props HTML nativas
  test('should pass through native HTML props', () => {
    render(
      <Input 
        label="Email"
        maxLength={50}
        autoComplete="email"
        data-testid="custom-input"
      />
    );
    
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('maxLength', '50');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  // Test de combinación error + helper text
  test('should handle both error and helper text correctly', () => {
    const helperText = 'Enter your email address';
    const errorMessage = 'Invalid email format';
    
    render(
      <Input 
        label="Email" 
        helperText={helperText} 
        error={errorMessage}
      />
    );
    
    const input = screen.getByLabelText(/email/i);
    
    // Error debería tener prioridad sobre helper text
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText(helperText)).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});