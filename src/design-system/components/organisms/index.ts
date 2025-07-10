/**
 * Organisms - Componentes de nivel organismo del sistema de diseño
 * Exporta todos los componentes complejos y de alto nivel
 */

// Navigation
export {
  Navigation,
  Breadcrumb,
  useNavigation,
  type NavigationProps,
  type NavigationItem,
  type BreadcrumbProps,
  type BreadcrumbItem
} from './Navigation';

// Header
export {
  Header,
  type HeaderProps,
  type HeaderUser,
  type HeaderNotification
} from './Header/Header';

// Footer
export {
  Footer,
  FooterSimple,
  type FooterProps,
  type FooterSimpleProps,
  type FooterLink,
  type FooterSection,
  type SocialLink
} from './Footer/Footer';