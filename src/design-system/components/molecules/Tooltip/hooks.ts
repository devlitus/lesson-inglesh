/**
 * Tooltip Hooks and Utilities
 * Hooks y utilidades para el componente Tooltip
 */

import React from 'react';

/**
 * Hook para manejar delays de show/hide
 */
export function useTooltipDelay(
  showDelay: number,
  hideDelay: number,
  onShow: () => void,
  onHide: () => void
) {
  const showTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const clearTimeouts = React.useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = undefined;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
  }, []);

  const scheduleShow = React.useCallback(() => {
    clearTimeouts();
    showTimeoutRef.current = setTimeout(onShow, showDelay);
  }, [showDelay, onShow, clearTimeouts]);

  const scheduleHide = React.useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(onHide, hideDelay);
  }, [hideDelay, onHide, clearTimeouts]);

  React.useEffect(() => {
    return clearTimeouts;
  }, [clearTimeouts]);

  return { scheduleShow, scheduleHide, clearTimeouts };
}

/**
 * Hook para posicionamiento automático
 */
export function useTooltipPosition(
  isOpen: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
  tooltipRef: React.RefObject<HTMLElement | null>,
  placement: string,
  offset: number
) {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = React.useState(placement);

  React.useEffect(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let finalPlacement = placement;
    let top = 0;
    let left = 0;

    // Calcular posición base
    switch (placement) {
      case 'top':
      case 'top-start':
      case 'top-end':
        top = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'bottom':
      case 'bottom-start':
      case 'bottom-end':
        top = triggerRect.bottom + offset;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }

    // Ajustar horizontalmente para top/bottom
    if (placement.startsWith('top') || placement.startsWith('bottom')) {
      if (placement.endsWith('-start')) {
        left = triggerRect.left;
      } else if (placement.endsWith('-end')) {
        left = triggerRect.right - tooltipRect.width;
      } else {
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      }
    }

    // Verificar límites del viewport y ajustar si es necesario
    if (top < 0 && (placement.startsWith('top'))) {
      // Cambiar a bottom si no cabe arriba
      finalPlacement = placement.replace('top', 'bottom');
      top = triggerRect.bottom + offset;
    } else if (top + tooltipRect.height > viewport.height && placement.startsWith('bottom')) {
      // Cambiar a top si no cabe abajo
      finalPlacement = placement.replace('bottom', 'top');
      top = triggerRect.top - tooltipRect.height - offset;
    }

    if (left < 0) {
      left = 8; // Margen mínimo
    } else if (left + tooltipRect.width > viewport.width) {
      left = viewport.width - tooltipRect.width - 8;
    }

    setPosition({ top, left });
    setActualPlacement(finalPlacement);
  }, [isOpen, placement, offset]);

  return { position, actualPlacement };
}

/**
 * Contexto para configuración global de tooltips
 */
export const TooltipContext = React.createContext<{
  showDelay: number;
  hideDelay: number;
}>({ showDelay: 500, hideDelay: 0 });

/**
 * Hook para manejar tooltips programáticamente
 */
export function useTooltip(initialOpen = false) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const show = React.useCallback(() => setIsOpen(true), []);
  const hide = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    show,
    hide,
    toggle
  };
}

/**
 * Hook para usar la configuración del TooltipProvider
 */
export function useTooltipContext() {
  return React.useContext(TooltipContext);
}