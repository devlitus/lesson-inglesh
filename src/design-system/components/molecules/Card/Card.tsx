/**
 * Card Component - Molecule
 * Componente de tarjeta flexible para mostrar contenido estructurado
 */

import React from 'react';
import { cn } from '../../../utils/cn';

// Tipos base para los diferentes elementos
type CardDivProps = React.HTMLAttributes<HTMLDivElement> & {
  clickable?: false;
};

type CardButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  clickable: true;
};

// Props comunes para ambos tipos
interface BaseCardProps {
  /** Variante visual de la tarjeta */
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  /** Tamaño de la tarjeta */
  size?: 'sm' | 'md' | 'lg';
  /** Si la tarjeta está deshabilitada */
  disabled?: boolean;
  /** Contenido de la tarjeta */
  children: React.ReactNode;
}

// Unión de tipos para CardProps
export type CardProps = BaseCardProps & (CardDivProps | CardButtonProps);

/**
 * Componente Card base
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" clickable onClick={handleClick}>
 *   <CardHeader>
 *     <CardTitle>Título de la tarjeta</CardTitle>
 *   </CardHeader>
 *   <CardBody>
 *     Contenido de la tarjeta
 *   </CardBody>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement | HTMLButtonElement, CardProps>(
  (props, ref) => {
    const {
      variant = 'default',
      size = 'md',
      disabled = false,
      children,
      className,
      clickable,
      ...restProps
    } = props;
    // Clases base
    const baseClasses = [
      'relative',
      'overflow-hidden',
      'transition-all',
      'duration-200',
      'ease-in-out'
    ];

    // Variantes
    const variantClasses = {
      default: [
        'bg-white',
        'border',
        'border-gray-200',
        'rounded-lg'
      ],
      outlined: [
        'bg-white',
        'border-2',
        'border-gray-300',
        'rounded-lg'
      ],
      elevated: [
        'bg-white',
        'border',
        'border-gray-200',
        'rounded-lg',
        'shadow-md',
        'hover:shadow-lg'
      ],
      filled: [
        'bg-gray-50',
        'border',
        'border-gray-200',
        'rounded-lg'
      ]
    };

    // Tamaños (padding interno)
    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    // Estados interactivos
    const interactiveClasses = clickable && !disabled ? [
      'cursor-pointer',
      'hover:shadow-lg',
      'hover:scale-[1.02]',
      'active:scale-[0.98]',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-2'
    ] : [];

    // Estados disabled
    const disabledClasses = disabled ? [
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none'
    ] : [];

    // Combinar clases
    const cardClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      interactiveClasses,
      disabledClasses,
      className
    );

    if (clickable) {
      const buttonProps = restProps as React.ButtonHTMLAttributes<HTMLButtonElement>;
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={cardClasses}
          disabled={disabled}
          {...buttonProps}
        >
          {children}
        </button>
      );
    }

    const divProps = restProps as React.HTMLAttributes<HTMLDivElement>;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cardClasses}
        {...divProps}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Componente CardHeader
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Contenido del header */
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 pb-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Componente CardTitle
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Nivel del heading */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Contenido del título */
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ level = 3, className, children, ...props }, ref) => {
    const HeadingComponent = React.createElement(
      `h${level}`,
      {
        ref,
        className: cn(
          'text-lg font-semibold leading-none tracking-tight text-gray-900',
          className
        ),
        ...props
      },
      children
    );
    
    return HeadingComponent;
  }
);

CardTitle.displayName = 'CardTitle';

/**
 * Componente CardDescription
 */
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Contenido de la descripción */
  children: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-gray-600', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

/**
 * Componente CardBody
 */
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Contenido del body */
  children: React.ReactNode;
}

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-gray-700', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

/**
 * Componente CardFooter
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Contenido del footer */
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

/**
 * Componente CardImage
 */
export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Posición de la imagen */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Proporción de aspecto */
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall';
}

export const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  (
    {
      position = 'top',
      aspectRatio = 'video',
      className,
      alt,
      ...props
    },
    ref
  ) => {
    // Clases de posición
    const positionClasses = {
      top: '-mt-6 -mx-6 mb-4',
      bottom: '-mb-6 -mx-6 mt-4',
      left: '-ml-6 -my-6 mr-4 w-1/3',
      right: '-mr-6 -my-6 ml-4 w-1/3'
    };

    // Clases de proporción
    const aspectRatioClasses = {
      square: 'aspect-square',
      video: 'aspect-video',
      wide: 'aspect-[21/9]',
      tall: 'aspect-[3/4]'
    };

    return (
      <img
        ref={ref}
        className={cn(
          'object-cover',
          'rounded-lg',
          aspectRatioClasses[aspectRatio],
          positionClasses[position],
          className
        )}
        alt={alt}
        {...props}
      />
    );
  }
);

CardImage.displayName = 'CardImage';