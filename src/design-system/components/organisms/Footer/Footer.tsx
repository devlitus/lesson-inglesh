/**
 * Footer Component - Organism
 * Componente de pie de página con enlaces, información de contacto y redes sociales
 */

import React from 'react';
import { cn } from '../../../utils/cn';
import { Button } from '../../atoms';

export interface FooterLink {
  /** ID único del enlace */
  id: string;
  /** Texto del enlace */
  label: string;
  /** URL del enlace */
  href: string;
  /** Si se abre en nueva pestaña */
  external?: boolean;
  /** Función onClick personalizada */
  onClick?: () => void;
}

export interface FooterSection {
  /** ID único de la sección */
  id: string;
  /** Título de la sección */
  title: string;
  /** Enlaces de la sección */
  links: FooterLink[];
}

export interface SocialLink {
  /** ID único */
  id: string;
  /** Nombre de la red social */
  name: string;
  /** URL del perfil */
  href: string;
  /** Icono de la red social */
  icon: React.ReactNode;
  /** Color de la marca */
  color?: string;
}

export interface FooterProps {
  /** Logo o marca */
  logo?: React.ReactNode;
  /** Descripción de la empresa */
  description?: string;
  /** Secciones de enlaces */
  sections?: FooterSection[];
  /** Enlaces de redes sociales */
  socialLinks?: SocialLink[];
  /** Información de copyright */
  copyright?: string;
  /** Enlaces legales */
  legalLinks?: FooterLink[];
  /** Información de contacto */
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  /** Newsletter */
  newsletter?: {
    title: string;
    description: string;
    placeholder: string;
    onSubscribe: (email: string) => void;
  };
  /** Variante del footer */
  variant?: 'default' | 'minimal' | 'dark';
  /** Clases adicionales */
  className?: string;
}

/**
 * Componente NewsletterSubscription
 */
interface NewsletterSubscriptionProps {
  title: string;
  description: string;
  placeholder: string;
  onSubscribe: (email: string) => void;
  variant: 'default' | 'minimal' | 'dark';
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  title,
  description,
  placeholder,
  onSubscribe,
  variant
}) => {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubscribe(email.trim());
      setEmail('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className={cn(
          'text-sm font-semibold',
          variant === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {title}
        </h3>
        <p className={cn(
          'mt-2 text-sm',
          variant === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          {description}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          className={cn(
            'flex-1 px-3 py-2 text-sm rounded-md border',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            variant === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          )}
        />
        <Button
          type="submit"
          size="sm"
          loading={isSubmitting}
          disabled={!email.trim()}
        >
          Suscribirse
        </Button>
      </form>
    </div>
  );
};

/**
 * Componente ContactInfo
 */
interface ContactInfoProps {
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  variant: 'default' | 'minimal' | 'dark';
}

const ContactInfo: React.FC<ContactInfoProps> = ({ contactInfo, variant }) => {
  const textColor = variant === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const linkColor = variant === 'dark' ? 'text-white hover:text-gray-200' : 'text-gray-900 hover:text-gray-700';

  return (
    <div className="space-y-3">
      <h3 className={cn(
        'text-sm font-semibold',
        variant === 'dark' ? 'text-white' : 'text-gray-900'
      )}>
        Contacto
      </h3>
      
      <div className="space-y-2">
        {contactInfo.email && (
          <div className="flex items-center space-x-2">
            <svg className={cn('w-4 h-4', textColor)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a
              href={`mailto:${contactInfo.email}`}
              className={cn('text-sm transition-colors', linkColor)}
            >
              {contactInfo.email}
            </a>
          </div>
        )}
        
        {contactInfo.phone && (
          <div className="flex items-center space-x-2">
            <svg className={cn('w-4 h-4', textColor)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a
              href={`tel:${contactInfo.phone}`}
              className={cn('text-sm transition-colors', linkColor)}
            >
              {contactInfo.phone}
            </a>
          </div>
        )}
        
        {contactInfo.address && (
          <div className="flex items-start space-x-2">
            <svg className={cn('w-4 h-4 mt-0.5', textColor)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={cn('text-sm', textColor)}>
              {contactInfo.address}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Componente Footer principal
 * 
 * @example
 * ```tsx
 * const footerSections = [
 *   {
 *     id: 'products',
 *     title: 'Productos',
 *     links: [
 *       { id: '1', label: 'Características', href: '/features' },
 *       { id: '2', label: 'Precios', href: '/pricing' }
 *     ]
 *   }
 * ];
 * 
 * <Footer
 *   logo={<Logo />}
 *   description="Descripción de la empresa"
 *   sections={footerSections}
 *   socialLinks={socialLinks}
 *   copyright="© 2024 Mi Empresa. Todos los derechos reservados."
 *   variant="default"
 * />
 * ```
 */
export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      logo,
      description,
      sections = [],
      socialLinks = [],
      copyright,
      legalLinks = [],
      contactInfo,
      newsletter,
      variant = 'default',
      className
    },
    ref
  ) => {
    const containerClasses = cn(
      'w-full',
      // Variantes
      variant === 'default' && 'bg-gray-50 border-t border-gray-200',
      variant === 'minimal' && 'bg-white border-t border-gray-100',
      variant === 'dark' && 'bg-gray-900 border-t border-gray-800',
      className
    );

    const textColor = variant === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const linkColor = variant === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900';
    const titleColor = variant === 'dark' ? 'text-white' : 'text-gray-900';

    return (
      <footer ref={ref} className={containerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contenido principal */}
          <div className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Logo y descripción */}
              <div className="lg:col-span-1">
                {logo && (
                  <div className="mb-4">
                    {logo}
                  </div>
                )}
                
                {description && (
                  <p className={cn('text-sm leading-6', textColor)}>
                    {description}
                  </p>
                )}
                
                {/* Redes sociales */}
                {socialLinks.length > 0 && (
                  <div className="mt-6">
                    <div className="flex space-x-4">
                      {socialLinks.map((social) => (
                        <a
                          key={social.id}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'p-2 rounded-md transition-colors',
                            variant === 'dark'
                              ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          )}
                          aria-label={social.name}
                        >
                          {social.icon}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Secciones de enlaces */}
              {sections.map((section) => (
                <div key={section.id}>
                  <h3 className={cn('text-sm font-semibold mb-4', titleColor)}>
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className={cn('text-sm transition-colors', linkColor)}
                          onClick={link.onClick}
                        >
                          {link.label}
                          {link.external && (
                            <svg className="inline w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Información de contacto */}
              {contactInfo && (
                <div>
                  <ContactInfo contactInfo={contactInfo} variant={variant} />
                </div>
              )}

              {/* Newsletter */}
              {newsletter && (
                <div>
                  <NewsletterSubscription
                    title={newsletter.title}
                    description={newsletter.description}
                    placeholder={newsletter.placeholder}
                    onSubscribe={newsletter.onSubscribe}
                    variant={variant}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Línea divisoria */}
          <div className={cn(
            'border-t',
            variant === 'dark' ? 'border-gray-800' : 'border-gray-200'
          )} />

          {/* Copyright y enlaces legales */}
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Copyright */}
              {copyright && (
                <p className={cn('text-sm', textColor)}>
                  {copyright}
                </p>
              )}

              {/* Enlaces legales */}
              {legalLinks.length > 0 && (
                <div className="flex space-x-6">
                  {legalLinks.map((link, index) => (
                    <React.Fragment key={link.id}>
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className={cn('text-sm transition-colors', linkColor)}
                        onClick={link.onClick}
                      >
                        {link.label}
                      </a>
                      {index < legalLinks.length - 1 && (
                        <span className={cn('text-sm', textColor)}>•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

/**
 * Componente FooterSimple para casos básicos
 */
export interface FooterSimpleProps {
  /** Texto de copyright */
  copyright: string;
  /** Enlaces simples */
  links?: FooterLink[];
  /** Variante */
  variant?: 'default' | 'minimal' | 'dark';
  /** Clases adicionales */
  className?: string;
}

export const FooterSimple = React.forwardRef<HTMLElement, FooterSimpleProps>(
  ({ copyright, links = [], variant = 'default', className }, ref) => {
    const containerClasses = cn(
      'w-full py-6',
      variant === 'default' && 'bg-gray-50 border-t border-gray-200',
      variant === 'minimal' && 'bg-white border-t border-gray-100',
      variant === 'dark' && 'bg-gray-900 border-t border-gray-800',
      className
    );

    const textColor = variant === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const linkColor = variant === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900';

    return (
      <footer ref={ref} className={containerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <p className={cn('text-sm', textColor)}>
              {copyright}
            </p>
            
            {links.length > 0 && (
              <div className="flex space-x-6">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={cn('text-sm transition-colors', linkColor)}
                    onClick={link.onClick}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }
);

FooterSimple.displayName = 'FooterSimple';