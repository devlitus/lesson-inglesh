/**
 * Spinner Component - Atom
 * Componente de carga con múltiples variantes
 */

import React from 'react';
import { cn } from '../../../utils/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tamaño del spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Variante visual */
  variant?: 'default' | 'primary' | 'secondary' | 'white';
  /** Tipo de animación */
  type?: 'spin' | 'pulse' | 'bounce' | 'dots' | 'bars';
  /** Velocidad de la animación */
  speed?: 'slow' | 'normal' | 'fast';
  /** Etiqueta para accesibilidad */
  label?: string;
}

/**
 * Componente Spinner para estados de carga
 * 
 * @example
 * ```tsx
 * <Spinner size="md" variant="primary" />
 * 
 * <Spinner type="dots" label="Cargando datos..." />
 * 
 * <Spinner size="lg" type="pulse" variant="secondary" />
 * ```
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      variant = 'default',
      type = 'spin',
      speed = 'normal',
      label = 'Cargando...',
      className,
      ...props
    },
    ref
  ) => {
    // Tamaños
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };

    // Colores
    const variantClasses = {
      default: 'text-gray-600',
      primary: 'text-blue-600',
      secondary: 'text-purple-600',
      white: 'text-white'
    };

    // Velocidades
    const speedClasses = {
      slow: 'duration-1000',
      normal: 'duration-700',
      fast: 'duration-500'
    };

    // Spinner circular (tipo spin)
    const SpinSpinner = () => (
      <svg
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant],
          speedClasses[speed]
        )}
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

    // Spinner de pulso
    const PulseSpinner = () => (
      <div
        className={cn(
          'animate-pulse',
          'rounded-full',
          'bg-current',
          sizeClasses[size],
          variantClasses[variant],
          speedClasses[speed]
        )}
        aria-hidden="true"
      />
    );

    // Spinner de rebote
    const BounceSpinner = () => {
      const dotSize = {
        xs: 'w-1 h-1',
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
        xl: 'w-3 h-3'
      };

      return (
        <div className="flex space-x-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'animate-bounce',
                'rounded-full',
                'bg-current',
                dotSize[size],
                variantClasses[variant],
                speedClasses[speed]
              )}
              style={{
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      );
    };

    // Spinner de puntos
    const DotsSpinner = () => {
      const dotSize = {
        xs: 'w-1 h-1',
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
        xl: 'w-3 h-3'
      };

      return (
        <div className="flex space-x-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse',
                'rounded-full',
                'bg-current',
                dotSize[size],
                variantClasses[variant],
                speedClasses[speed]
              )}
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      );
    };

    // Spinner de barras
    const BarsSpinner = () => {
      const barWidth = {
        xs: 'w-0.5',
        sm: 'w-0.5',
        md: 'w-1',
        lg: 'w-1',
        xl: 'w-1.5'
      };

      const barHeight = {
        xs: 'h-3',
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-8',
        xl: 'h-12'
      };

      return (
        <div className="flex items-end space-x-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse',
                'bg-current',
                barWidth[size],
                barHeight[size],
                variantClasses[variant],
                speedClasses[speed]
              )}
              style={{
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      );
    };

    // Seleccionar el tipo de spinner
    const renderSpinner = () => {
      switch (type) {
        case 'pulse':
          return <PulseSpinner />;
        case 'bounce':
          return <BounceSpinner />;
        case 'dots':
          return <DotsSpinner />;
        case 'bars':
          return <BarsSpinner />;
        case 'spin':
        default:
          return <SpinSpinner />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center justify-center', className)}
        role="status"
        aria-label={label}
        {...props}
      >
        {renderSpinner()}
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * Spinner de página completa con overlay
 */
export interface FullPageSpinnerProps extends Omit<SpinnerProps, 'size'> {
  /** Mostrar overlay de fondo */
  overlay?: boolean;
  /** Color del overlay */
  overlayColor?: 'light' | 'dark';
  /** Mensaje de carga */
  message?: string;
}

export const FullPageSpinner = React.forwardRef<HTMLDivElement, FullPageSpinnerProps>(
  (
    {
      overlay = true,
      overlayColor = 'light',
      message,
      variant = 'primary',
      type = 'spin',
      label = 'Cargando página...',
      className,
      ...props
    },
    ref
  ) => {
    const overlayClasses = {
      light: 'bg-white/80 backdrop-blur-sm',
      dark: 'bg-black/50 backdrop-blur-sm'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed',
          'inset-0',
          'z-50',
          'flex',
          'flex-col',
          'items-center',
          'justify-center',
          'gap-4',
          overlay && overlayClasses[overlayColor],
          className
        )}
        {...props}
      >
        <Spinner
          size="xl"
          variant={variant}
          type={type}
          label={label}
        />
        {message && (
          <p className={cn(
            'text-sm',
            'font-medium',
            overlayColor === 'dark' ? 'text-white' : 'text-gray-700'
          )}>
            {message}
          </p>
        )}
      </div>
    );
  }
);

FullPageSpinner.displayName = 'FullPageSpinner';