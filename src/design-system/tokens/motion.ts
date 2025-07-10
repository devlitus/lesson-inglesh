/**
 * Design Tokens - Motion & Transitions
 * Sistema de animaciones y transiciones
 */

export const motion = {
  // Duraciones de transición
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
    slowest: '1000ms'
  },

  // Funciones de timing (easing)
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Curvas personalizadas
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Transiciones predefinidas
  transition: {
    none: 'none',
    all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    // Transiciones específicas para componentes
    button: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    modal: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    dropdown: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    tooltip: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Animaciones keyframes
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' }
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' }
    },
    slideInUp: {
      from: { transform: 'translateY(100%)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' }
    },
    slideInDown: {
      from: { transform: 'translateY(-100%)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' }
    },
    slideInLeft: {
      from: { transform: 'translateX(-100%)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' }
    },
    slideInRight: {
      from: { transform: 'translateX(100%)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' }
    },
    scaleIn: {
      from: { transform: 'scale(0.9)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' }
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: '1' },
      to: { transform: 'scale(0.9)', opacity: '0' }
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' }
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
      '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }
    }
  },

  // Configuraciones de animación
  animation: {
    none: 'none',
    spin: 'spin 1s linear infinite',
    ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite',
    fadeIn: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    fadeOut: 'fadeOut 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideInUp: 'slideInUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideInDown: 'slideInDown 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideInLeft: 'slideInLeft 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideInRight: 'slideInRight 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    scaleIn: 'scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    scaleOut: 'scaleOut 200ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

export type MotionToken = typeof motion;