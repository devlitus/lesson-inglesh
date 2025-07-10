# Lesson Inglesh Design System

Sistema de diseño completo y modular para la aplicación Lesson Inglesh, construido con React, TypeScript y Tailwind CSS.

## 🎨 Filosofía de Diseño

Nuestro sistema de diseño se basa en los principios de **Atomic Design** de Brad Frost, organizando los componentes en una jerarquía clara y reutilizable:

- **Tokens**: Variables de diseño fundamentales (colores, tipografía, espaciado, etc.)
- **Átomos**: Componentes básicos e indivisibles (Button, Input, Label)
- **Moléculas**: Combinaciones de átomos (FormField, Card, Modal)
- **Organismos**: Componentes complejos (Navigation, Header, Footer)

## 📁 Estructura del Proyecto

```
src/design-system/
├── tokens/                 # Tokens de diseño
│   ├── colors.ts          # Paleta de colores
│   ├── typography.ts      # Tipografía y texto
│   ├── spacing.ts         # Espaciado y layout
│   ├── motion.ts          # Animaciones y transiciones
│   └── index.ts           # Exportaciones centralizadas
├── utils/                 # Utilidades
│   └── cn.ts             # Utilidades de clases CSS
├── components/            # Componentes
│   ├── atoms/            # Componentes atómicos
│   ├── molecules/        # Componentes moleculares
│   ├── organisms/        # Componentes de organismo
│   └── index.ts          # Exportaciones por nivel
├── index.ts              # Punto de entrada principal
└── README.md             # Esta documentación
```

## 🚀 Instalación y Uso

### Importación Básica

```tsx
import { Button, Input, Card } from '@/design-system';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Escribe algo..." />
      <Button variant="primary">Enviar</Button>
    </Card>
  );
}
```

### Configuración del Proveedor

```tsx
import { DesignSystemProvider } from '@/design-system';

function App() {
  return (
    <DesignSystemProvider>
      <MyApp />
    </DesignSystemProvider>
  );
}
```

## 🎯 Tokens de Diseño

### Colores

```tsx
import { colors } from '@/design-system';

// Colores primarios
colors.primary[500]    // #3B82F6
colors.secondary[500]  // #8B5CF6
colors.success[500]    // #10B981
colors.error[500]      // #EF4444
```

### Tipografía

```tsx
import { typography } from '@/design-system';

// Tamaños de fuente
typography.fontSize.xs     // 0.75rem
typography.fontSize.sm     // 0.875rem
typography.fontSize.base   // 1rem
typography.fontSize.lg     // 1.125rem

// Estilos predefinidos
typography.styles.h1       // Estilo para títulos principales
typography.styles.body     // Estilo para texto de cuerpo
```

### Espaciado

```tsx
import { spacing } from '@/design-system';

// Espacios
spacing.space[1]    // 0.25rem
spacing.space[4]    // 1rem
spacing.space[8]    // 2rem

// Radios de borde
spacing.borderRadius.sm   // 0.125rem
spacing.borderRadius.md   // 0.375rem
spacing.borderRadius.lg   // 0.5rem
```

## 🧩 Componentes

### Átomos

#### Button

```tsx
import { Button } from '@/design-system';

<Button variant="primary" size="md" loading={false}>
  Click me
</Button>

// Variantes: primary, secondary, outline, ghost, destructive
// Tamaños: xs, sm, md, lg
```

#### Input

```tsx
import { Input } from '@/design-system';

<Input
  type="text"
  placeholder="Placeholder"
  error="Mensaje de error"
  leftIcon={<SearchIcon />}
  rightIcon={<EyeIcon />}
/>
```

#### Badge

```tsx
import { Badge } from '@/design-system';

<Badge variant="primary" size="sm">
  Nuevo
</Badge>

// Variantes: primary, secondary, success, warning, error
```

### Moléculas

#### FormField

```tsx
import { FormField } from '@/design-system';

<FormField
  label="Email"
  required
  error="Email inválido"
  help="Ingresa tu email"
>
  <Input type="email" />
</FormField>
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardBody } from '@/design-system';

<Card variant="default" size="md">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardBody>
    Contenido de la tarjeta
  </CardBody>
</Card>
```

#### Modal

```tsx
import { Modal, ModalBody, ModalFooter, useModal } from '@/design-system';

function MyComponent() {
  const { isOpen, open, close } = useModal();
  
  return (
    <>
      <Button onClick={open}>Abrir Modal</Button>
      <Modal
        open={isOpen}
        onClose={close}
        title="Título del Modal"
        size="md"
      >
        <ModalBody>
          Contenido del modal
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={close}>Cancelar</Button>
          <Button onClick={close}>Confirmar</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

### Organismos

#### Navigation

```tsx
import { Navigation, useNavigation } from '@/design-system';

const navigationItems = [
  {
    id: '1',
    label: 'Inicio',
    href: '/',
    icon: <HomeIcon />,
    active: true
  },
  {
    id: '2',
    label: 'Productos',
    children: [
      { id: '2-1', label: 'Categoría 1', href: '/cat1' },
      { id: '2-2', label: 'Categoría 2', href: '/cat2' }
    ]
  }
];

function MyNavigation() {
  const { mobileMenuOpen, toggleMobileMenu } = useNavigation();
  
  return (
    <Navigation
      items={navigationItems}
      logo={<Logo />}
      variant="default"
      mobileMenuOpen={mobileMenuOpen}
      onMobileMenuToggle={toggleMobileMenu}
    />
  );
}
```

#### Header

```tsx
import { Header } from '@/design-system';

const user = {
  id: '1',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  avatar: '/avatar.jpg'
};

<Header
  logo={<Logo />}
  navigationItems={navigationItems}
  user={user}
  showSearch
  onSearch={handleSearch}
  onLogout={handleLogout}
  variant="default"
  sticky
/>
```

## 🛠️ Utilidades

### Función `cn`

Utilidad para combinar clases CSS de manera eficiente:

```tsx
import { cn } from '@/design-system';

const buttonClasses = cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  disabled && 'opacity-50 cursor-not-allowed',
  className
);
```

### Hooks Útiles

```tsx
import { useBreakpoint, useDarkMode, useTheme } from '@/design-system';

function MyComponent() {
  const breakpoint = useBreakpoint(); // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  const { isDark, toggle } = useDarkMode();
  const { theme, updateTheme } = useTheme();
  
  return (
    <div>
      <p>Breakpoint actual: {breakpoint}</p>
      <p>Modo oscuro: {isDark ? 'Sí' : 'No'}</p>
      <Button onClick={toggle}>Cambiar tema</Button>
    </div>
  );
}
```

## 🎨 Personalización

### Extender Tokens

```tsx
import { createTheme, colors } from '@/design-system';

const customTheme = createTheme({
  colors: {
    ...colors,
    brand: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      900: '#0c4a6e'
    }
  }
});
```

### Componentes Personalizados

```tsx
import { Button, cn } from '@/design-system';

const CustomButton = ({ className, ...props }) => {
  return (
    <Button
      className={cn('shadow-lg hover:shadow-xl', className)}
      {...props}
    />
  );
};
```

## 📱 Responsive Design

Todos los componentes están diseñados para ser completamente responsivos:

```tsx
// Los breakpoints están disponibles globalmente
const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
};

// Uso con Tailwind CSS
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Contenido responsivo */}
</div>
```

## ♿ Accesibilidad

Todos los componentes siguen las mejores prácticas de accesibilidad:

- **ARIA**: Atributos ARIA apropiados
- **Teclado**: Navegación completa por teclado
- **Foco**: Indicadores de foco visibles
- **Contraste**: Cumple con WCAG 2.1 AA
- **Lectores de pantalla**: Compatibilidad completa

## 🧪 Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/design-system';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});
```

## 📚 Recursos Adicionales

- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contribución

Para contribuir al sistema de diseño:

1. Sigue la estructura de Atomic Design
2. Incluye documentación y ejemplos
3. Asegúrate de que sea accesible
4. Añade tests apropiados
5. Mantén consistencia con los tokens existentes

## 📄 Licencia

Este sistema de diseño es parte del proyecto Lesson Inglesh y está sujeto a sus términos de licencia.