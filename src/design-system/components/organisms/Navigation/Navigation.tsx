/**
 * Navigation Component - Organism
 * Componente de navegación principal con soporte para responsive y accesibilidad
 */

import React from 'react';
import { cn } from '../../../utils/cn';
import { Button, Badge } from '../../atoms';
import { Dropdown, DropdownItem } from '../../molecules';

export interface NavigationItem {
  /** ID único del item */
  id: string;
  /** Texto del item */
  label: string;
  /** URL o ruta */
  href?: string;
  /** Icono del item */
  icon?: React.ReactNode;
  /** Badge/contador */
  badge?: string | number;
  /** Si está activo */
  active?: boolean;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Items hijos para submenús */
  children?: NavigationItem[];
  /** Función onClick personalizada */
  onClick?: () => void;
}

export interface NavigationProps {
  /** Items de navegación */
  items: NavigationItem[];
  /** Logo o marca */
  logo?: React.ReactNode;
  /** Acciones del lado derecho */
  actions?: React.ReactNode;
  /** Si está en modo móvil */
  isMobile?: boolean;
  /** Si el menú móvil está abierto */
  mobileMenuOpen?: boolean;
  /** Función para controlar el menú móvil */
  onMobileMenuToggle?: () => void;
  /** Variante de la navegación */
  variant?: 'default' | 'minimal' | 'sidebar';
  /** Posición fija */
  sticky?: boolean;
  /** Clases adicionales */
  className?: string;
}

/**
 * Hook para detectar si es móvil
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

/**
 * Componente NavigationItem individual
 */
interface NavigationItemComponentProps {
  item: NavigationItem;
  variant: 'default' | 'minimal' | 'sidebar';
  isMobile?: boolean;
  onItemClick?: (item: NavigationItem) => void;
}

const NavigationItemComponent: React.FC<NavigationItemComponentProps> = ({
  item,
  variant,
  isMobile,
  onItemClick
}) => {
  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const itemContent = (
    <>
      {item.icon && (
        <span className={cn(
          'flex-shrink-0',
          variant === 'sidebar' ? 'mr-3' : 'mr-2'
        )}>
          {item.icon}
        </span>
      )}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge
          variant="secondary"
          size="sm"
          className="ml-2"
        >
          {item.badge}
        </Badge>
      )}
    </>
  );

  const baseClasses = cn(
    'flex items-center w-full',
    'text-sm font-medium',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    // Variantes
    variant === 'default' && [
      'px-3 py-2 rounded-md',
      item.active
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    ],
    variant === 'minimal' && [
      'px-3 py-2',
      item.active
        ? 'text-blue-600 border-b-2 border-blue-600'
        : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
    ],
    variant === 'sidebar' && [
      'px-4 py-3 rounded-lg',
      item.active
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    ],
    // Estados
    item.disabled && 'opacity-50 cursor-not-allowed',
    isMobile && 'justify-start'
  );

  // Si tiene hijos, renderizar como dropdown
  if (item.children && item.children.length > 0) {
    return (
      <Dropdown
        trigger={
          <button className={baseClasses} disabled={item.disabled}>
            {itemContent}
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
          </button>
        }
        placement="bottom-start"
      >
        {item.children.map((child) => (
          <DropdownItem
            key={child.id}
            icon={child.icon}
            disabled={child.disabled}
            onClick={() => {
              if (child.onClick) child.onClick();
              if (onItemClick) onItemClick(child);
            }}
          >
            {child.label}
            {child.badge && (
              <Badge variant="secondary" size="sm" className="ml-auto">
                {child.badge}
              </Badge>
            )}
          </DropdownItem>
        ))}
      </Dropdown>
    );
  }

  // Item simple
  if (item.href) {
    return (
      <a
        href={item.href}
        className={baseClasses}
        onClick={handleClick}
        aria-disabled={item.disabled}
      >
        {itemContent}
      </a>
    );
  }

  return (
    <button
      className={baseClasses}
      onClick={handleClick}
      disabled={item.disabled}
    >
      {itemContent}
    </button>
  );
};

/**
 * Componente Navigation principal
 * 
 * @example
 * ```tsx
 * const navigationItems = [
 *   { id: '1', label: 'Inicio', href: '/', icon: <HomeIcon />, active: true },
 *   { id: '2', label: 'Productos', href: '/products', badge: '12' },
 *   {
 *     id: '3',
 *     label: 'Configuración',
 *     children: [
 *       { id: '3-1', label: 'Perfil', href: '/profile' },
 *       { id: '3-2', label: 'Preferencias', href: '/settings' }
 *     ]
 *   }
 * ];
 * 
 * <Navigation
 *   items={navigationItems}
 *   logo={<Logo />}
 *   actions={<UserMenu />}
 *   variant="default"
 * />
 * ```
 */
export const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  (
    {
      items,
      logo,
      actions,
      isMobile: propIsMobile,
      mobileMenuOpen = false,
      onMobileMenuToggle,
      variant = 'default',
      sticky = false,
      className
    },
    ref
  ) => {
    const detectedIsMobile = useIsMobile();
    const isMobile = propIsMobile ?? detectedIsMobile;

    const handleItemClick = () => {
      // Cerrar menú móvil al hacer click en un item
      if (isMobile && onMobileMenuToggle) {
        onMobileMenuToggle();
      }
    };

    const containerClasses = cn(
      'w-full',
      // Posicionamiento
      sticky && 'sticky top-0 z-40',
      // Variantes
      variant === 'default' && 'bg-white border-b border-gray-200 shadow-sm',
      variant === 'minimal' && 'bg-white border-b border-gray-200',
      variant === 'sidebar' && 'bg-gray-50 border-r border-gray-200 h-full',
      className
    );

    const contentClasses = cn(
      'flex items-center',
      variant === 'sidebar' ? 'flex-col h-full p-4' : 'justify-between px-4 py-3',
      !isMobile && variant !== 'sidebar' && 'max-w-7xl mx-auto'
    );

    return (
      <nav ref={ref} className={containerClasses} role="navigation">
        <div className={contentClasses}>
          {/* Logo */}
          {logo && (
            <div className={cn(
              'flex-shrink-0',
              variant === 'sidebar' && 'mb-8'
            )}>
              {logo}
            </div>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className={cn(
              'flex',
              variant === 'sidebar' ? 'flex-col space-y-2 flex-1' : 'space-x-1'
            )}>
              {items.map((item) => (
                <NavigationItemComponent
                  key={item.id}
                  item={item}
                  variant={variant}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && variant !== 'sidebar' && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={onMobileMenuToggle}
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          )}

          {/* Actions */}
          {actions && !isMobile && (
            <div className={cn(
              'flex-shrink-0',
              variant === 'sidebar' && 'mt-auto'
            )}>
              {actions}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && variant !== 'sidebar' && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {items.map((item) => (
                <NavigationItemComponent
                  key={item.id}
                  item={item}
                  variant={variant}
                  isMobile={true}
                  onItemClick={handleItemClick}
                />
              ))}
              
              {/* Actions en móvil */}
              {actions && (
                <div className="pt-3 border-t border-gray-200">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';



/**
 * Componente Breadcrumb para navegación secundaria
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator, className }, ref) => {
    const defaultSeparator = (
      <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    );

    return (
      <nav
        ref={ref}
        className={cn('flex items-center space-x-2 text-sm', className)}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2">
                    {separator || defaultSeparator}
                  </span>
                )}
                
                {isLast ? (
                  <span className="text-gray-900 font-medium">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';