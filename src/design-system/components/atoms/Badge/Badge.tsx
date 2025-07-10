/**
 * Badge Component - Atom
 * Componente para mostrar estados, etiquetas y notificaciones
 */

import React from 'react';
import { cn } from '../../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Variante visual del badge */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'outline';
  /** Tamaño del badge */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Forma del badge */
  shape?: 'rounded' | 'pill' | 'square';
  /** Icono a la izquierda */
  leftIcon?: React.ReactNode;
  /** Icono a la derecha */
  rightIcon?: React.ReactNode;
  /** Punto indicador */
  dot?: boolean;
  /** Función para remover el badge */
  onRemove?: () => void;
  /** Contenido del badge */
  children?: React.ReactNode;
}

/**
 * Componente Badge versátil para mostrar estados y etiquetas
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Activo</Badge>
 * 
 * <Badge variant="error" onRemove={handleRemove}>
 *   Error crítico
 * </Badge>
 * 
 * <Badge variant="primary" leftIcon={<Icon />} dot>
 *   Nuevo
 * </Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      shape = 'rounded',
      leftIcon,
      rightIcon,
      dot = false,
      onRemove,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Clases base
    const baseClasses = [
      'inline-flex',
      'items-center',
      'gap-1',
      'font-medium',
      'select-none',
      'transition-colors',
      'duration-150',
      'ease-in-out'
    ];

    // Variantes de color
    const variantClasses = {
      default: [
        'bg-gray-100',
        'text-gray-800',
        'border-gray-200'
      ],
      primary: [
        'bg-blue-100',
        'text-blue-800',
        'border-blue-200'
      ],
      secondary: [
        'bg-purple-100',
        'text-purple-800',
        'border-purple-200'
      ],
      success: [
        'bg-green-100',
        'text-green-800',
        'border-green-200'
      ],
      error: [
        'bg-red-100',
        'text-red-800',
        'border-red-200'
      ],
      warning: [
        'bg-yellow-100',
        'text-yellow-800',
        'border-yellow-200'
      ],
      info: [
        'bg-cyan-100',
        'text-cyan-800',
        'border-cyan-200'
      ],
      outline: [
        'bg-transparent',
        'text-gray-700',
        'border',
        'border-gray-300',
        'hover:bg-gray-50'
      ]
    };

    // Tamaños
    const sizeClasses = {
      xs: ['text-xs', 'px-1.5', 'py-0.5', 'min-h-[16px]'],
      sm: ['text-xs', 'px-2', 'py-0.5', 'min-h-[20px]'],
      md: ['text-sm', 'px-2.5', 'py-0.5', 'min-h-[24px]'],
      lg: ['text-sm', 'px-3', 'py-1', 'min-h-[28px]']
    };

    // Formas
    const shapeClasses = {
      rounded: 'rounded-md',
      pill: 'rounded-full',
      square: 'rounded-none'
    };

    // Tamaños de iconos según el tamaño del badge
    const iconSizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-4 h-4'
    };

    // Combinar clases
    const badgeClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      shapeClasses[shape],
      className
    );

    // Punto indicador
    const DotIndicator = () => (
      <span
        className={cn(
          'w-2 h-2 rounded-full flex-shrink-0',
          {
            'bg-gray-400': variant === 'default',
            'bg-blue-500': variant === 'primary',
            'bg-purple-500': variant === 'secondary',
            'bg-green-500': variant === 'success',
            'bg-red-500': variant === 'error',
            'bg-yellow-500': variant === 'warning',
            'bg-cyan-500': variant === 'info',
            'bg-gray-500': variant === 'outline'
          }
        )}
        aria-hidden="true"
      />
    );

    // Botón de remover
    const RemoveButton = () => (
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          'flex-shrink-0',
          'rounded-full',
          'p-0.5',
          'hover:bg-black/10',
          'focus:outline-none',
          'focus:ring-1',
          'focus:ring-current',
          'transition-colors',
          iconSizeClasses[size]
        )}
        aria-label="Remover"
      >
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    );

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {/* Punto indicador */}
        {dot && <DotIndicator />}
        
        {/* Icono izquierdo */}
        {leftIcon && (
          <span className={cn('flex-shrink-0', iconSizeClasses[size])} aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Contenido */}
        {children && (
          <span className="truncate">
            {children}
          </span>
        )}

        {/* Icono derecho */}
        {rightIcon && (
          <span className={cn('flex-shrink-0', iconSizeClasses[size])} aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Botón de remover */}
        {onRemove && <RemoveButton />}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Badge de notificación (típicamente usado como indicador numérico)
 */
export interface NotificationBadgeProps extends Omit<BadgeProps, 'children' | 'size' | 'shape'> {
  /** Número a mostrar */
  count?: number;
  /** Número máximo a mostrar antes de usar "+" */
  max?: number;
  /** Mostrar punto en lugar de número cuando count es 0 */
  showZero?: boolean;
  /** Posición del badge */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  (
    {
      count = 0,
      max = 99,
      showZero = false,
      position = 'top-right',
      variant = 'error',
      className,
      ...props
    },
    ref
  ) => {
    // No mostrar si count es 0 y showZero es false
    if (count === 0 && !showZero) {
      return null;
    }

    // Determinar qué mostrar
    const displayValue = count > max ? `${max}+` : count.toString();
    const showDot = count === 0 && showZero;

    // Posiciones
    const positionClasses = {
      'top-right': '-top-1 -right-1',
      'top-left': '-top-1 -left-1',
      'bottom-right': '-bottom-1 -right-1',
      'bottom-left': '-bottom-1 -left-1'
    };

    return (
      <Badge
        ref={ref}
        variant={variant}
        size="xs"
        shape="pill"
        dot={showDot}
        className={cn(
          'absolute',
          'min-w-[20px]',
          'h-5',
          'flex',
          'items-center',
          'justify-center',
          'text-xs',
          'font-bold',
          'leading-none',
          positionClasses[position],
          className
        )}
        {...props}
      >
        {!showDot && displayValue}
      </Badge>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';