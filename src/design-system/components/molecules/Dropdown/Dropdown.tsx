/**
 * Dropdown Component - Molecule
 * Componente de menú desplegable con navegación por teclado y accesibilidad
 */

import React from 'react';
import { cn } from '../../../utils/cn';
import { Button } from '../../atoms';

export interface DropdownProps {
  /** Elemento que activa el dropdown */
  trigger: React.ReactNode;
  /** Contenido del dropdown */
  children: React.ReactNode;
  /** Si el dropdown está abierto */
  open?: boolean;
  /** Función para controlar el estado */
  onOpenChange?: (open: boolean) => void;
  /** Posición del dropdown */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left' | 'right';
  /** Offset desde el trigger */
  offset?: number;
  /** Si se cierra al hacer click fuera */
  closeOnClickOutside?: boolean;
  /** Si se cierra al presionar Escape */
  closeOnEscape?: boolean;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Clases adicionales para el contenido */
  contentClassName?: string;
}

/**
 * Hook para manejar clicks fuera del componente
 */
function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true
) {
  React.useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, handler, enabled]);
}

/**
 * Hook para navegación por teclado
 */
function useKeyboardNavigation(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  onClose: () => void
) {
  React.useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const items = container.querySelectorAll('[role="menuitem"]');
    let currentIndex = -1;

    const focusItem = (index: number) => {
      if (items[index]) {
        (items[index] as HTMLElement).focus();
        currentIndex = index;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          focusItem(nextIndex);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          focusItem(prevIndex);
          break;
        }
        case 'Home':
          e.preventDefault();
          focusItem(0);
          break;
        case 'End':
          e.preventDefault();
          focusItem(items.length - 1);
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, containerRef, onClose]);
}

/**
 * Componente Dropdown principal
 * 
 * @example
 * ```tsx
 * <Dropdown
 *   trigger={<Button>Opciones</Button>}
 *   placement="bottom-start"
 * >
 *   <DropdownItem onClick={() => console.log('Editar')}>Editar</DropdownItem>
 *   <DropdownItem onClick={() => console.log('Eliminar')}>Eliminar</DropdownItem>
 * </Dropdown>
 * ```
 */
export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      trigger,
      children,
      open: controlledOpen,
      onOpenChange,
      placement = 'bottom-start',
      offset = 4,
      closeOnClickOutside = true,
      className,
      contentClassName
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    
    const containerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Combine external ref with internal ref
    React.useImperativeHandle(ref, () => containerRef.current!, []);

    const handleOpenChange = (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
    };

    const handleClose = () => handleOpenChange(false);
    const handleToggle = () => handleOpenChange(!isOpen);

    // Hooks para funcionalidad
    useClickOutside(containerRef, handleClose, closeOnClickOutside && isOpen);
    useKeyboardNavigation(isOpen, contentRef, handleClose);

    // Clases de posicionamiento
    const placementClasses = {
      'bottom-start': 'top-full left-0',
      'bottom-end': 'top-full right-0',
      'top-start': 'bottom-full left-0',
      'top-end': 'bottom-full right-0',
      'left': 'right-full top-0',
      'right': 'left-full top-0'
    };

    return (
      <div
        ref={containerRef}
        className={cn('relative inline-block', className)}
      >
        {/* Trigger */}
        <div onClick={handleToggle}>
          {trigger}
        </div>

        {/* Content */}
        {isOpen && (
          <div
            ref={contentRef}
            className={cn(
              'absolute z-50',
              'min-w-[8rem] w-max',
              'bg-white rounded-md shadow-lg',
              'border border-gray-200',
              'py-1',
              'animate-in fade-in-0 zoom-in-95',
              'duration-200',
              placementClasses[placement],
              contentClassName
            )}
            style={{
              marginTop: placement.startsWith('bottom') ? offset : undefined,
              marginBottom: placement.startsWith('top') ? offset : undefined,
              marginLeft: placement === 'right' ? offset : undefined,
              marginRight: placement === 'left' ? offset : undefined
            }}
            role="menu"
            aria-orientation="vertical"
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

/**
 * Componente DropdownItem
 */
export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Contenido del item */
  children: React.ReactNode;
  /** Si el item está deshabilitado */
  disabled?: boolean;
  /** Icono del item */
  icon?: React.ReactNode;
  /** Si es destructivo */
  destructive?: boolean;
  /** Función onClick */
  onClick?: () => void;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  (
    {
      children,
      disabled = false,
      icon,
      destructive = false,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex items-center w-full px-3 py-2',
          'text-sm text-left',
          'transition-colors duration-150',
          // Estados normales
          !destructive && !disabled && [
            'text-gray-700 hover:bg-gray-100',
            'focus:bg-gray-100 focus:outline-none'
          ],
          // Estado destructivo
          destructive && !disabled && [
            'text-red-600 hover:bg-red-50',
            'focus:bg-red-50 focus:outline-none'
          ],
          // Estado deshabilitado
          disabled && [
            'text-gray-400 cursor-not-allowed',
            'opacity-50'
          ],
          className
        )}
        role="menuitem"
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {icon && (
          <span className="mr-2 flex-shrink-0">
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

/**
 * Componente DropdownSeparator
 */
export type DropdownSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export const DropdownSeparator = React.forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('my-1 h-px bg-gray-200', className)}
        role="separator"
        {...props}
      />
    );
  }
);

DropdownSeparator.displayName = 'DropdownSeparator';

/**
 * Componente DropdownLabel
 */
export interface DropdownLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DropdownLabel = React.forwardRef<HTMLDivElement, DropdownLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-3 py-2 text-xs font-medium',
          'text-gray-500 uppercase tracking-wider',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownLabel.displayName = 'DropdownLabel';



/**
 * Componente DropdownMenu preconfigurado
 */
export interface DropdownMenuProps extends Omit<DropdownProps, 'trigger'> {
  /** Texto del botón trigger */
  triggerText?: string;
  /** Variante del botón trigger */
  triggerVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Tamaño del botón trigger */
  triggerSize?: 'xs' | 'sm' | 'md' | 'lg';
  /** Icono del botón trigger */
  triggerIcon?: React.ReactNode;
}

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  (
    {
      triggerText = 'Opciones',
      triggerVariant = 'outline',
      triggerSize = 'md',
      triggerIcon,
      children,
      ...dropdownProps
    },
    ref
  ) => {
    const defaultIcon = (
      <svg
        className="w-4 h-4 ml-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );

    return (
      <Dropdown
        ref={ref}
        trigger={
          <Button
            variant={triggerVariant}
            size={triggerSize}
            rightIcon={triggerIcon || defaultIcon}
          >
            {triggerText}
          </Button>
        }
        {...dropdownProps}
      >
        {children}
      </Dropdown>
    );
  }
);

DropdownMenu.displayName = 'DropdownMenu';