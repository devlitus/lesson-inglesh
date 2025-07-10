/**
 * Tooltip Component - Molecule
 * Componente de tooltip accesible con posicionamiento automático
 */

import React from 'react';
import { cn } from '../../../utils/cn';
import { useTooltipDelay, useTooltipPosition, TooltipContext } from './hooks';

export interface TooltipProps {
  /** Contenido del tooltip */
  content: React.ReactNode;
  /** Elemento que activa el tooltip */
  children: React.ReactNode;
  /** Posición preferida del tooltip */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  /** Delay antes de mostrar (ms) */
  showDelay?: number;
  /** Delay antes de ocultar (ms) */
  hideDelay?: number;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Trigger del tooltip */
  trigger?: 'hover' | 'focus' | 'click' | 'manual';
  /** Estado manual del tooltip */
  open?: boolean;
  /** Callback cuando cambia el estado */
  onOpenChange?: (open: boolean) => void;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Clases adicionales para el contenido */
  contentClassName?: string;
  /** Offset desde el elemento */
  offset?: number;
}



/**
 * Componente Tooltip principal
 * 
 * @example
 * ```tsx
 * <Tooltip content="Información adicional" placement="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      placement = 'top',
      showDelay = 500,
      hideDelay = 0,
      disabled = false,
      trigger = 'hover',
      open: controlledOpen,
      onOpenChange,
      className,
      contentClassName,
      offset = 8
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = disabled ? false : (isControlled ? controlledOpen : internalOpen);
    
    const triggerRef = React.useRef<HTMLElement | null>(null);
    const tooltipRef = React.useRef<HTMLDivElement | null>(null);
    const tooltipId = React.useId();

    const handleOpenChange = (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
    };

    const handleShow = () => handleOpenChange(true);
    const handleHide = () => handleOpenChange(false);

    const { scheduleShow, scheduleHide } = useTooltipDelay(
      showDelay,
      hideDelay,
      handleShow,
      handleHide
    );

    const { position, actualPlacement } = useTooltipPosition(
      isOpen,
      triggerRef,
      tooltipRef,
      placement,
      offset
    );

    // Event handlers
    const handleMouseEnter = () => {
      if (trigger === 'hover') {
        scheduleShow();
      }
    };

    const handleMouseLeave = () => {
      if (trigger === 'hover') {
        scheduleHide();
      }
    };

    const handleFocus = () => {
      if (trigger === 'focus') {
        handleShow();
      }
    };

    const handleBlur = () => {
      if (trigger === 'focus') {
        handleHide();
      }
    };

    const handleClick = () => {
      if (trigger === 'click') {
        handleOpenChange(!isOpen);
      }
    };

    // Clonar el children para agregar props
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
    const existingProps = child.props || {};
    
    // Crear función de ref que maneja tanto el triggerRef como el ref original del child
    const handleRef = (node: HTMLElement | null) => {
      triggerRef.current = node;
      // Si el child tiene su propio ref, también lo llamamos
      const childRef = (child as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef) {
        (childRef as React.RefObject<HTMLElement | null>).current = node;
      }
    };
    
    const triggerElement = React.cloneElement(
      child,
      {
        ...existingProps,
        ref: handleRef,
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          existingProps.onMouseEnter?.(e);
          handleMouseEnter();
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
          existingProps.onMouseLeave?.(e);
          handleMouseLeave();
        },
        onFocus: (e: React.FocusEvent<HTMLElement>) => {
          existingProps.onFocus?.(e);
          handleFocus();
        },
        onBlur: (e: React.FocusEvent<HTMLElement>) => {
          existingProps.onBlur?.(e);
          handleBlur();
        },
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          existingProps.onClick?.(e);
          handleClick();
        },
        'aria-describedby': isOpen ? tooltipId : undefined
      }
    );

    // Clases para la flecha según la posición
    const arrowClasses = {
      top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-gray-900',
      'top-start': 'bottom-0 left-2 translate-y-full border-t-gray-900',
      'top-end': 'bottom-0 right-2 translate-y-full border-t-gray-900',
      bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-gray-900',
      'bottom-start': 'top-0 left-2 -translate-y-full border-b-gray-900',
      'bottom-end': 'top-0 right-2 -translate-y-full border-b-gray-900',
      left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-gray-900',
      right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-gray-900'
    };

    return (
      <div ref={ref} className={cn('relative inline-block', className)}>
        {triggerElement}
        
        {isOpen && (
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={cn(
              'fixed z-50',
              'px-2 py-1',
              'bg-gray-900 text-white text-xs',
              'rounded shadow-lg',
              'max-w-xs',
              'animate-in fade-in-0 zoom-in-95',
              'duration-200',
              contentClassName
            )}
            style={{
              top: position.top,
              left: position.left
            }}
          >
            {content}
            
            {/* Flecha */}
            <div
              className={cn(
                'absolute w-0 h-0',
                'border-4 border-transparent',
                arrowClasses[actualPlacement as keyof typeof arrowClasses]
              )}
            />
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';

/**
 * Componente TooltipProvider para configuración global
 */
export interface TooltipProviderProps {
  children: React.ReactNode;
  /** Delay global para mostrar */
  showDelay?: number;
  /** Delay global para ocultar */
  hideDelay?: number;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  showDelay = 500,
  hideDelay = 0
}) => {
  return (
    <TooltipContext.Provider value={{ showDelay, hideDelay }}>
      {children}
    </TooltipContext.Provider>
  );
};