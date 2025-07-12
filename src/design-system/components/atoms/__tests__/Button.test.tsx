/**
 * Button Component Tests
 * Tests críticos para el componente Button según TESTING_STRATEGY.md
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button/Button';

describe('Button Component - Critical Tests', () => {
  // Test básico de renderizado
  test('should render with text content', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  // Test de variantes críticas
  test('should apply correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-blue-600', 'text-white');
    
    rerender(<Button variant="destructive">Delete</Button>);
    expect(button).toHaveClass('bg-red-600', 'text-white');
  });

  // Test de tamaños
  test('should apply correct size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('h-8', 'px-3', 'text-xs');
    
    rerender(<Button size="lg">Large</Button>);
    expect(button).toHaveClass('h-12', 'px-6', 'text-base');
  });

  // Test de estado de carga
  test('should show loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument(); // spinner
  });

  // Test de estado disabled
  test('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  // Test de eventos de click
  test('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test de no ejecutar click cuando está disabled
  test('should not trigger click when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test de no ejecutar click cuando está loading
  test('should not trigger click when loading', () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test de iconos
  test('should render with left and right icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">←</span>;
    const RightIcon = () => <span data-testid="right-icon">→</span>;
    
    render(
      <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
        With Icons
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icons')).toBeInTheDocument();
  });

  // Test de botón solo icono
  test('should render icon-only button correctly', () => {
    const Icon = () => <span data-testid="icon">⚙</span>;
    
    render(<Button iconOnly leftIcon={<Icon />} aria-label="Settings" />);
    
    const button = screen.getByRole('button', { name: /settings/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  // Test de ancho completo
  test('should apply full width when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('w-full');
  });

  // Test de accesibilidad - focus
  test('should be focusable and have focus styles', () => {
    render(<Button>Focusable</Button>);
    const button = screen.getByRole('button');
    
    button.focus();
    expect(button).toHaveFocus();
    expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-offset-2');
  });

  // Test de forwarded ref
  test('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>With Ref</Button>);
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  // Test de props HTML nativas
  test('should pass through native HTML props', () => {
    render(
      <Button 
        type="submit" 
        form="test-form" 
        data-testid="custom-button"
        aria-describedby="help-text"
      >
        Submit
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('form', 'test-form');
    expect(button).toHaveAttribute('aria-describedby', 'help-text');
  });
});