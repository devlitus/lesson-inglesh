/**
 * Input Component - Atom
 * Componente de entrada con validación y accesibilidad
 */

import React from 'react';
import { cn } from '../../../utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Etiqueta del input */
  label?: string;
  /** Texto de ayuda */
  helperText?: string;
  /** Mensaje de error */
  error?: string;
  /** Tamaño del input */
  size?: 'sm' | 'md' | 'lg';
  /** Variante visual */
  variant?: 'default' | 'filled' | 'flushed';
  /** Icono a la izquierda */
  leftIcon?: React.ReactNode;
  /** Icono a la derecha */
  rightIcon?: React.ReactNode;
  /** Estado de carga */
  loading?: boolean;
  /** Ancho completo */
  fullWidth?: boolean;
  /** Ocultar etiqueta visualmente pero mantenerla para lectores de pantalla */
  hideLabel?: boolean;
}

/**
 * Componente Input con soporte completo para accesibilidad y validación
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="tu@email.com"
 *   helperText="Ingresa tu dirección de email"
 *   required
 * />
 * 
 * <Input
 *   label="Contraseña"
 *   type="password"
 *   error="La contraseña debe tener al menos 8 caracteres"
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      hideLabel = false,
      className,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    // Generar ID único si no se proporciona
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperTextId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    
    const hasError = Boolean(error);
    const isDisabled = disabled || loading;

    // Clases base del contenedor
    const containerClasses = cn(
      'relative',
      fullWidth ? 'w-full' : 'w-auto'
    );

    // Clases de la etiqueta
    const labelClasses = cn(
      'block',
      'text-sm',
      'font-medium',
      'text-gray-700',
      'mb-1',
      hideLabel && 'sr-only'
    );

    // Clases base del input
    const baseInputClasses = [
      // Layout
      'block',
      'w-full',
      'appearance-none',
      
      // Tipografía
      'text-gray-900',
      'placeholder-gray-400',
      
      // Interactividad
      'transition-colors',
      'duration-200',
      'ease-in-out',
      
      // Estados de focus
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-0',
      
      // Estados disabled
      'disabled:bg-gray-50',
      'disabled:text-gray-500',
      'disabled:cursor-not-allowed',
      'disabled:opacity-75'
    ];

    // Variantes de estilo
    const variantClasses = {
      default: [
        'bg-white',
        'border',
        'border-gray-300',
        'rounded-md',
        'shadow-sm',
        'focus:border-blue-500',
        'focus:ring-blue-500',
        hasError && [
          'border-red-300',
          'focus:border-red-500',
          'focus:ring-red-500'
        ]
      ],
      filled: [
        'bg-gray-50',
        'border',
        'border-transparent',
        'rounded-md',
        'focus:bg-white',
        'focus:border-blue-500',
        'focus:ring-blue-500',
        hasError && [
          'bg-red-50',
          'focus:border-red-500',
          'focus:ring-red-500'
        ]
      ],
      flushed: [
        'bg-transparent',
        'border-0',
        'border-b-2',
        'border-gray-300',
        'rounded-none',
        'px-0',
        'focus:border-blue-500',
        'focus:ring-0',
        hasError && [
          'border-red-300',
          'focus:border-red-500'
        ]
      ]
    };

    // Tamaños
    const sizeClasses = {
      sm: ['h-8', 'px-3', 'text-sm'],
      md: ['h-10', 'px-3', 'text-sm'],
      lg: ['h-12', 'px-4', 'text-base']
    };

    // Ajustar padding si hay iconos
    const paddingClasses = {
      left: leftIcon ? (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-12' : 'pl-10') : '',
      right: rightIcon || loading ? (size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-12' : 'pr-10') : ''
    };

    // Combinar clases del input
    const inputClasses = cn(
      baseInputClasses,
      variantClasses[variant],
      sizeClasses[size],
      paddingClasses.left,
      paddingClasses.right,
      className
    );

    // Clases de los iconos
    const iconClasses = cn(
      'absolute',
      'top-1/2',
      'transform',
      '-translate-y-1/2',
      'text-gray-400',
      'pointer-events-none',
      size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
    );

    const leftIconClasses = cn(
      iconClasses,
      'left-3'
    );

    const rightIconClasses = cn(
      iconClasses,
      'right-3'
    );

    // Clases del texto de ayuda
    const helperTextClasses = cn(
      'mt-1',
      'text-sm',
      hasError ? 'text-red-600' : 'text-gray-500'
    );

    // Spinner de carga
    const LoadingSpinner = () => (
      <svg
        className={cn(rightIconClasses, 'animate-spin')}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <div className={containerClasses}>
        {/* Etiqueta */}
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="requerido">
                *
              </span>
            )}
          </label>
        )}

        {/* Contenedor del input con iconos */}
        <div className="relative">
          {/* Icono izquierdo */}
          {leftIcon && (
            <div className={leftIconClasses} aria-hidden="true">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={isDisabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={cn(
              helperText && helperTextId,
              error && errorId
            )}
            {...props}
          />

          {/* Icono derecho o spinner */}
          {loading ? (
            <LoadingSpinner />
          ) : rightIcon ? (
            <div className={rightIconClasses} aria-hidden="true">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {/* Texto de ayuda o error */}
        {(helperText || error) && (
          <p
            id={error ? errorId : helperTextId}
            className={helperTextClasses}
            role={error ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';