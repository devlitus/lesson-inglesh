/**
 * Design System - Lesson Inglesh
 * Componentes React del sistema de diseño
 */

import React from 'react';
import { defaultTheme, type Theme } from './tokens';

// =============================================================================
// COMPONENTES
// =============================================================================

// Átomos
export {Badge, Button, Input, Label, Spinner} from './components/atoms';

// Moléculas
export {Card, Dropdown, FormField, Modal, Tooltip} from './components/molecules';

// Organismos
export {Footer, Header, Navigation} from './components/organisms';

// =============================================================================
// THEME PROVIDER
// =============================================================================

/**
 * Proveedor de tema para el sistema de diseño
 */
interface DesignSystemProviderProps {
  children: React.ReactNode;
  theme?: Theme;
}

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({
  children,
  theme = defaultTheme
}) => {
  return (
    <div data-theme={theme.colors || 'default'}>
      {children}
    </div>
  );
};