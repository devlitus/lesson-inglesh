/**
 * Label Component - Atom
 * Componente de etiqueta accesible y reutilizable
 */

import React from 'react';
import { cn } from '../../../utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Tamaño de la etiqueta */
  size?: 'sm' | 'md' | 'lg';
  /** Peso de la fuente */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Indica si el campo es requerido */
  required?: boolean;
  /** Texto del indicador de requerido */
  requiredText?: string;
  /** Ocultar visualmente pero mantener para lectores de pantalla */
  srOnly?: boolean;
  /** Variante de color */
  variant?: 'default' | 'muted' | 'error' | 'success';
  /** Contenido de la etiqueta */
  children: React.ReactNode;
}

/**
 * Componente Label accesible y flexible
 * 
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   Dirección de email
 * </Label>
 * 
 * <Label size="lg" weight="semibold" variant="error">
 *   Campo con error
 * </Label>
 * 
 * <Label srOnly htmlFor="search">
 *   Buscar productos
 * </Label>
 * ```
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      size = 'md',
      weight = 'medium',
      required = false,
      requiredText = 'requerido',
      srOnly = false,
      variant = 'default',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Clases base
    const baseClasses = [
      'block',
      'select-none',
      'cursor-pointer'
    ];

    // Tamaños
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };

    // Pesos de fuente
    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    };

    // Variantes de color
    const variantClasses = {
      default: 'text-gray-700',
      muted: 'text-gray-500',
      error: 'text-red-700',
      success: 'text-green-700'
    };

    // Clase para screen reader only
    const srOnlyClasses = srOnly ? 'sr-only' : '';

    // Combinar todas las clases
    const labelClasses = cn(
      baseClasses,
      sizeClasses[size],
      weightClasses[weight],
      variantClasses[variant],
      srOnlyClasses,
      className
    );

    return (
      <label ref={ref} className={labelClasses} {...props}>
        {children}
        {required && (
          <span
            className="text-red-500 ml-1"
            aria-label={requiredText}
            title={requiredText}
          >
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

/**
 * Componente de etiqueta flotante para inputs
 * Útil para diseños más modernos
 */
export interface FloatingLabelProps extends Omit<LabelProps, 'srOnly'> {
  /** Si la etiqueta debe flotar (cuando hay valor en el input) */
  floating?: boolean;
  /** Posición de la etiqueta flotante */
  position?: 'top' | 'inside';
}

export const FloatingLabel = React.forwardRef<HTMLLabelElement, FloatingLabelProps>(
  (
    {
      floating = false,
      position = 'top',
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Clases base para etiqueta flotante
    const baseClasses = [
      'absolute',
      'pointer-events-none',
      'transition-all',
      'duration-200',
      'ease-in-out',
      'select-none'
    ];

    // Posiciones y estados
    const positionClasses = {
      top: {
        default: 'left-3 top-3 text-gray-400',
        floating: 'left-3 -top-2 text-xs bg-white px-1 text-gray-600'
      },
      inside: {
        default: 'left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
        floating: 'left-3 top-2 text-xs text-gray-600'
      }
    };

    // Tamaños para etiqueta flotante
    const sizeClasses = {
      sm: floating ? 'text-xs' : 'text-xs',
      md: floating ? 'text-xs' : 'text-sm',
      lg: floating ? 'text-sm' : 'text-base'
    };

    const labelClasses = cn(
      baseClasses,
      floating 
        ? positionClasses[position].floating 
        : positionClasses[position].default,
      sizeClasses[size],
      className
    );

    return (
      <Label
        ref={ref}
        className={labelClasses}
        {...props}
      >
        {children}
      </Label>
    );
  }
);

FloatingLabel.displayName = 'FloatingLabel';