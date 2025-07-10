/**
 * Button Component - Atom
 * Componente de botón con múltiples variantes y estados
 */

import React from 'react';
import { cn } from '../../../utils/cn';


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual del botón */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  /** Tamaño del botón */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Estado de carga */
  loading?: boolean;
  /** Icono a la izquierda del texto */
  leftIcon?: React.ReactNode;
  /** Icono a la derecha del texto */
  rightIcon?: React.ReactNode;
  /** Solo icono, sin texto */
  iconOnly?: boolean;
  /** Ancho completo */
  fullWidth?: boolean;
  /** Contenido del botón */
  children?: React.ReactNode;
}

/**
 * Componente Button con soporte completo para accesibilidad
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Hacer clic
 * </Button>
 * 
 * <Button variant="outline" loading leftIcon={<Icon />}>
 *   Cargando...
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Clases base del botón
    const baseClasses = [
      // Layout y display
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'relative',
      'overflow-hidden',
      
      // Tipografía
      'font-medium',
      'text-sm',
      'leading-none',
      'whitespace-nowrap',
      
      // Interactividad
      'cursor-pointer',
      'select-none',
      'outline-none',
      
      // Transiciones
      'transition-all',
      'duration-150',
      'ease-in-out',
      
      // Estados de focus
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-offset-2',
      
      // Estados disabled
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    ];

    // Variantes de estilo
    const variantClasses = {
      primary: [
        'bg-blue-600',
        'text-white',
        'border-transparent',
        'hover:bg-blue-700',
        'active:bg-blue-800',
        'focus-visible:ring-blue-500',
        'shadow-sm',
        'hover:shadow-md'
      ],
      secondary: [
        'bg-gray-100',
        'text-gray-900',
        'border-transparent',
        'hover:bg-gray-200',
        'active:bg-gray-300',
        'focus-visible:ring-gray-500',
        'shadow-sm'
      ],
      outline: [
        'bg-transparent',
        'text-gray-700',
        'border',
        'border-gray-300',
        'hover:bg-gray-50',
        'hover:border-gray-400',
        'active:bg-gray-100',
        'focus-visible:ring-gray-500'
      ],
      ghost: [
        'bg-transparent',
        'text-gray-700',
        'border-transparent',
        'hover:bg-gray-100',
        'active:bg-gray-200',
        'focus-visible:ring-gray-500'
      ],
      link: [
        'bg-transparent',
        'text-blue-600',
        'border-transparent',
        'hover:text-blue-700',
        'hover:underline',
        'active:text-blue-800',
        'focus-visible:ring-blue-500',
        'p-0',
        'h-auto',
        'shadow-none'
      ],
      destructive: [
        'bg-red-600',
        'text-white',
        'border-transparent',
        'hover:bg-red-700',
        'active:bg-red-800',
        'focus-visible:ring-red-500',
        'shadow-sm',
        'hover:shadow-md'
      ]
    };

    // Tamaños
    const sizeClasses = {
      xs: iconOnly ? ['h-6', 'w-6', 'p-1'] : ['h-6', 'px-2', 'text-xs', 'rounded'],
      sm: iconOnly ? ['h-8', 'w-8', 'p-1.5'] : ['h-8', 'px-3', 'text-xs', 'rounded'],
      md: iconOnly ? ['h-10', 'w-10', 'p-2'] : ['h-10', 'px-4', 'text-sm', 'rounded-md'],
      lg: iconOnly ? ['h-12', 'w-12', 'p-2.5'] : ['h-12', 'px-6', 'text-base', 'rounded-md'],
      xl: iconOnly ? ['h-14', 'w-14', 'p-3'] : ['h-14', 'px-8', 'text-lg', 'rounded-lg']
    };

    // Clases de ancho
    const widthClasses = fullWidth ? ['w-full'] : [];

    // Combinar todas las clases
    const buttonClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      className
    );

    // Spinner de carga
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
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
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Icono izquierdo o spinner */}
        {loading ? (
          <LoadingSpinner />
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {/* Contenido del botón */}
        {!iconOnly && children && (
          <span className={loading ? 'opacity-0' : ''}>
            {children}
          </span>
        )}

        {/* Icono derecho */}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';