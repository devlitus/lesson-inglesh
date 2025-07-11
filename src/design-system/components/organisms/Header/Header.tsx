/**
 * Header Component - Organism
 * Componente de encabezado principal con navegación, búsqueda y acciones de usuario
 */

import React from 'react';
import { cn } from '../../../utils/cn';
import { Button, Input, Badge } from '../../atoms';
import { Dropdown, DropdownItem, DropdownSeparator } from '../../molecules';
import { Navigation, type NavigationItem } from '../Navigation/Navigation';

export interface HeaderUser {
  /** ID del usuario */
  id: string;
  /** Nombre del usuario */
  name: string;
  /** Email del usuario */
  email: string;
  /** Avatar del usuario */
  avatar?: string;
  /** Rol del usuario */
  role?: string;
}

export interface HeaderNotification {
  /** ID de la notificación */
  id: string;
  /** Título de la notificación */
  title: string;
  /** Descripción */
  description?: string;
  /** Tipo de notificación */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Si no está leída */
  unread?: boolean;
  /** Timestamp */
  timestamp?: Date;
  /** Función onClick */
  onClick?: () => void;
}

export interface HeaderProps {
  /** Logo o marca */
  logo?: React.ReactNode;
  /** Items de navegación */
  navigationItems?: NavigationItem[];
  /** Usuario actual */
  user?: HeaderUser;
  /** Notificaciones */
  notifications?: HeaderNotification[];
  /** Si mostrar búsqueda */
  showSearch?: boolean;
  /** Placeholder de búsqueda */
  searchPlaceholder?: string;
  /** Función de búsqueda */
  onSearch?: (query: string) => void;
  /** Función de logout */
  onLogout?: () => void;
  /** Función para ver perfil */
  onViewProfile?: () => void;
  /** Función para configuración */
  onSettings?: () => void;
  /** Acciones adicionales */
  actions?: React.ReactNode;
  /** Variante del header */
  variant?: 'default' | 'minimal' | 'transparent';
  /** Si es sticky */
  sticky?: boolean;
  /** Clases adicionales */
  className?: string;
}

/**
 * Componente UserMenu
 */
interface UserMenuProps {
  user: HeaderUser;
  onViewProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onViewProfile,
  onSettings,
  onLogout
}) => {
  const initials = (user.name || user.email || 'Usuario')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dropdown
      trigger={
        <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || user.email || 'Usuario'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
          )}
          <svg
            className="w-4 h-4 text-gray-500"
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
      placement="bottom-end"
    >
      <div className="px-3 py-2 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">{user.name || user.email || 'Usuario'}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
        {user.role && (
          <Badge variant="secondary" size="sm" className="mt-1">
            {user.role}
          </Badge>
        )}
      </div>
      
      {onViewProfile && (
        <DropdownItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          onClick={onViewProfile}
        >
          Ver perfil
        </DropdownItem>
      )}
      
      {onSettings && (
        <DropdownItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          onClick={onSettings}
        >
          Configuración
        </DropdownItem>
      )}
      
      <DropdownSeparator />
      
      {onLogout && (
        <DropdownItem
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          }
          onClick={onLogout}
          destructive
        >
          Cerrar sesión
        </DropdownItem>
      )}
    </Dropdown>
  );
};

/**
 * Componente NotificationMenu
 */
interface NotificationMenuProps {
  notifications: HeaderNotification[];
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ notifications }) => {
  const unreadCount = notifications.filter(n => n.unread).length;
  
  const getNotificationIcon = (type: HeaderNotification['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        );
      case 'warning':
        return (
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        );
      case 'error':
        return (
          <div className="w-2 h-2 bg-red-500 rounded-full" />
        );
      default:
        return (
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        );
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <Dropdown
      trigger={
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-5 5v-5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
          {unreadCount > 0 && (
            <Badge
              variant="error"
              size="sm"
              className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </button>
      }
      placement="bottom-end"
      contentClassName="w-80"
    >
      <div className="px-3 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
        {unreadCount > 0 && (
          <p className="text-xs text-gray-500">
            {unreadCount} sin leer
          </p>
        )}
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            No hay notificaciones
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              className={cn(
                'w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors',
                'border-b border-gray-100 last:border-b-0',
                notification.unread && 'bg-blue-50'
              )}
              onClick={notification.onClick}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm',
                    notification.unread ? 'font-medium text-gray-900' : 'text-gray-700'
                  )}>
                    {notification.title}
                  </p>
                  {notification.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {notification.description}
                    </p>
                  )}
                  {notification.timestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-200">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </Dropdown>
  );
};

/**
 * Componente Header principal
 * 
 * @example
 * ```tsx
 * <Header
 *   logo={<Logo />}
 *   navigationItems={navigationItems}
 *   user={currentUser}
 *   notifications={notifications}
 *   showSearch
 *   onSearch={handleSearch}
 *   onLogout={handleLogout}
 *   variant="default"
 *   sticky
 * />
 * ```
 */
export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      logo,
      navigationItems = [],
      user,
      notifications = [],
      showSearch = false,
      searchPlaceholder = 'Buscar...',
      onSearch,
      onLogout,
      onViewProfile,
      onSettings,
      actions,
      variant = 'default',
      sticky = false,
      className
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch && searchQuery.trim()) {
        onSearch(searchQuery.trim());
      }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    const containerClasses = cn(
      'w-full',
      // Posicionamiento
      sticky && 'sticky top-0 z-50',
      // Variantes
      variant === 'default' && 'bg-white border-b border-gray-200 shadow-sm',
      variant === 'minimal' && 'bg-white border-b border-gray-100',
      variant === 'transparent' && 'bg-white/80 backdrop-blur-md border-b border-gray-200/50',
      className
    );

    return (
      <header ref={ref} className={containerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y Navegación */}
            <div className="flex items-center space-x-8">
              {logo && (
                <div className="flex-shrink-0">
                  {logo}
                </div>
              )}
              
              {/* Navegación Desktop */}
              {navigationItems.length > 0 && (
                <div className="hidden md:block">
                  <Navigation
                    items={navigationItems}
                    variant="minimal"
                  />
                </div>
              )}
            </div>

            {/* Búsqueda */}
            {showSearch && (
              <div className="hidden md:block flex-1 max-w-lg mx-8">
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                    className="w-full"
                  />
                </form>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center space-x-4">
              {/* Acciones personalizadas */}
              {actions}
              
              {/* Notificaciones */}
              {notifications.length > 0 && (
                <div className="hidden md:block">
                  <NotificationMenu notifications={notifications} />
                </div>
              )}
              
              {/* Usuario */}
              {user && (
                <div className="hidden md:block">
                  <UserMenu
                    user={user}
                    onViewProfile={onViewProfile}
                    onSettings={onSettings}
                    onLogout={onLogout}
                  />
                </div>
              )}
              
              {/* Menú móvil */}
              {(navigationItems.length > 0 || user) && (
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Abrir menú"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Menú móvil */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Búsqueda móvil */}
                {showSearch && (
                  <div className="px-3 py-2">
                    <form onSubmit={handleSearchSubmit}>
                      <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        leftIcon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        }
                      />
                    </form>
                  </div>
                )}
                
                {/* Navegación móvil */}
                {navigationItems.length > 0 && (
                  <Navigation
                    items={navigationItems}
                    variant="default"
                    isMobile
                    mobileMenuOpen={mobileMenuOpen}
                    onMobileMenuToggle={() => setMobileMenuOpen(false)}
                  />
                )}
                
                {/* Usuario móvil */}
                {user && (
                  <div className="px-3 py-2 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {onViewProfile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={onViewProfile}
                        >
                          Ver perfil
                        </Button>
                      )}
                      {onSettings && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={onSettings}
                        >
                          Configuración
                        </Button>
                      )}
                      {onLogout && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                          onClick={onLogout}
                        >
                          Cerrar sesión
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';