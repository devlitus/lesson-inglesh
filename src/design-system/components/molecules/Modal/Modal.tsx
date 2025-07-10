/**
 * Modal Component - Molecule
 * Componente de modal accesible con overlay y manejo de foco
 */

import React from 'react';
import { cn } from '../../../utils/cn';
import { Button } from '../../atoms';
import { useFocusTrap, useBodyScrollLock } from './hooks';

export interface ModalProps {
  /** Si el modal está abierto */
  open: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Título del modal */
  title?: string;
  /** Descripción del modal */
  description?: string;
  /** Tamaño del modal */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Si se puede cerrar clickeando el overlay */
  closeOnOverlayClick?: boolean;
  /** Si se puede cerrar con la tecla Escape */
  closeOnEscape?: boolean;
  /** Si mostrar el botón de cerrar */
  showCloseButton?: boolean;
  /** Contenido del modal */
  children: React.ReactNode;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Clases adicionales para el overlay */
  overlayClassName?: string;
}



/**
 * Componente Modal con accesibilidad completa
 * 
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmar acción"
 *   description="¿Estás seguro de que quieres continuar?"
 *   size="md"
 * >
 *   <ModalFooter>
 *     <Button variant="outline" onClick={() => setIsOpen(false)}>
 *       Cancelar
 *     </Button>
 *     <Button onClick={handleConfirm}>
 *       Confirmar
 *     </Button>
 *   </ModalFooter>
 * </Modal>
 * ```
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      children,
      className,
      overlayClassName
    },
    ref
  ) => {
    // Combinar refs si es necesario
    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );
    const modalRef = React.useRef<HTMLDivElement>(null);
    const titleId = React.useId();
    const descriptionId = React.useId();

    // Hooks para accesibilidad
    useFocusTrap(open, modalRef);
    useBodyScrollLock(open);

    // Manejar tecla Escape
    React.useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, onClose]);

    // Manejar click en overlay
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    // Tamaños del modal
    const sizeClasses = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4'
    };

    if (!open) return null;

    return (
      <div
        className={cn(
          // Overlay
          'fixed inset-0 z-50',
          'bg-black/50 backdrop-blur-sm',
          'flex items-center justify-center',
          'p-4',
          overlayClassName
        )}
        onClick={handleOverlayClick}
        aria-hidden="true"
      >
        <div
          ref={(node) => {
            modalRef.current = node;
            combinedRef(node);
          }}
          className={cn(
            // Container del modal
            'relative w-full',
            'bg-white rounded-lg shadow-xl',
            'max-h-[90vh] overflow-hidden',
            'animate-in fade-in-0 zoom-in-95',
            'duration-200',
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
        >
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex-1">
                {title && (
                  <h2
                    id={titleId}
                    className="text-lg font-semibold text-gray-900"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descriptionId}
                    className="mt-1 text-sm text-gray-600"
                  >
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={onClose}
                  className="ml-4 -mt-1"
                  aria-label="Cerrar modal"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

/**
 * Componente ModalBody
 */
export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'ModalBody';

/**
 * Componente ModalFooter
 */
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3',
          'p-6 border-t border-gray-200',
          'bg-gray-50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';



/**
 * Componente de confirmación rápida
 */
export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  /** Texto del botón de confirmación */
  confirmText?: string;
  /** Texto del botón de cancelación */
  cancelText?: string;
  /** Variante del botón de confirmación */
  confirmVariant?: 'primary' | 'destructive';
  /** Función de confirmación */
  onConfirm: () => void;
  /** Estado de carga */
  loading?: boolean;
}

export const ConfirmModal = React.forwardRef<HTMLDivElement, ConfirmModalProps>(
  (
    {
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      confirmVariant = 'primary',
      onConfirm,
      loading = false,
      onClose,
      ...modalProps
    },
    ref
  ) => {
    const handleConfirm = () => {
      onConfirm();
      if (!loading) {
        onClose();
      }
    };

    return (
      <Modal
        ref={ref}
        onClose={onClose}
        size="sm"
        {...modalProps}
      >
        <ModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
);

ConfirmModal.displayName = 'ConfirmModal';