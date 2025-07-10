import React from 'react';

/**
 * Hook para manejar el estado de navegación
 */
export function useNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  const toggleMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const setActive = React.useCallback((itemId: string) => {
    setActiveItem(itemId);
  }, []);

  return {
    mobileMenuOpen,
    activeItem,
    toggleMobileMenu,
    closeMobileMenu,
    setActive
  };
}