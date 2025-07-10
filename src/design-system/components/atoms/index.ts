/**
 * Atoms - Index
 * Exportación centralizada de todos los componentes atómicos
 */

// Button
export { Button, type ButtonProps } from './Button/Button';

// Input
export { Input, type InputProps } from './Input/Input';

// Label
export { Label, FloatingLabel, type LabelProps, type FloatingLabelProps } from './Label/Label';

// Badge
export { Badge, NotificationBadge, type BadgeProps, type NotificationBadgeProps } from './Badge/Badge';

// Spinner
export { Spinner, FullPageSpinner, type SpinnerProps, type FullPageSpinnerProps } from './Spinner/Spinner';

// Re-export utilities
export { cn, cnMerge, createClassBuilder, cond, responsive } from '../../utils/cn';