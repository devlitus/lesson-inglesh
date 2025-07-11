/**
 * Utility for combining CSS classes
 * Similar to clsx but optimized for our design system
 */

type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassObject;
type ClassArray = ClassValue[];
type ClassObject = Record<string, unknown>;

/**
 * Combines multiple class values into a single string
 * Filters out falsy values and flattens arrays
 * 
 * @param classes - Class values to combine
 * @returns Combined class string
 * 
 * @example
 * ```ts
 * cn('base-class', condition && 'conditional-class', ['array', 'classes'])
 * // Returns: 'base-class conditional-class array classes'
 * 
 * cn('btn', { 'btn-primary': isPrimary, 'btn-disabled': disabled })
 * // Returns: 'btn btn-primary' (if isPrimary is true and disabled is false)
 * ```
 */
export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];

  for (const cls of classes) {
    if (!cls) continue;

    if (typeof cls === 'string' || typeof cls === 'number') {
      result.push(String(cls));
    } else if (Array.isArray(cls)) {
      const nested = cn(...cls);
      if (nested) result.push(nested);
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) result.push(key);
      }
    }
  }

  return result.join(' ');
}

/**
 * Variant of cn that also handles Tailwind CSS class conflicts
 * This is a simplified version - in a real project you might want to use tailwind-merge
 * 
 * @param classes - Class values to combine
 * @returns Combined and deduplicated class string
 */
export function cnMerge(...classes: ClassValue[]): string {
  const combined = cn(...classes);
  const classArray = combined.split(' ').filter(Boolean);
  
  // Simple deduplication (for a full solution, use tailwind-merge)
  const uniqueClasses = Array.from(new Set(classArray));
  
  return uniqueClasses.join(' ');
}

/**
 * Creates a class name builder function with predefined base classes
 * Useful for component variants
 * 
 * @param baseClasses - Base classes to always include
 * @returns Function that combines base classes with additional classes
 * 
 * @example
 * ```ts
 * const buttonClasses = createClassBuilder('btn', 'inline-flex', 'items-center');
 * const primaryButton = buttonClasses('bg-blue-500', 'text-white');
 * // Returns: 'btn inline-flex items-center bg-blue-500 text-white'
 * ```
 */
export function createClassBuilder(...baseClasses: ClassValue[]) {
  const base = cn(...baseClasses);
  
  return (...additionalClasses: ClassValue[]) => {
    return cn(base, ...additionalClasses);
  };
}

/**
 * Conditional class helper
 * 
 * @param condition - Condition to check
 * @param trueClasses - Classes to apply if condition is true
 * @param falseClasses - Classes to apply if condition is false
 * @returns Appropriate classes based on condition
 * 
 * @example
 * ```ts
 * const classes = cond(isActive, 'bg-blue-500', 'bg-gray-300');
 * ```
 */
export function cond(
  condition: boolean,
  trueClasses: ClassValue,
  falseClasses?: ClassValue
): string {
  return cn(condition ? trueClasses : falseClasses);
}

/**
 * Responsive class helper
 * 
 * @param classes - Object with breakpoint keys and class values
 * @returns Combined responsive classes
 * 
 * @example
 * ```ts
 * const responsiveClasses = responsive({
 *   base: 'text-sm',
 *   md: 'md:text-base',
 *   lg: 'lg:text-lg'
 * });
 * ```
 */
export function responsive(classes: Record<string, ClassValue>): string {
  return cn(Object.values(classes));
}

/**
 * Generates gradient styles based on a base color
 * Creates a subtle gradient effect from the base color to a lighter/darker variant
 * 
 * @param baseColor - Base color in hex format (e.g., '#3b82f6')
 * @param direction - Gradient direction ('to-r', 'to-br', 'to-b', etc.)
 * @param intensity - Gradient intensity ('light', 'medium', 'strong')
 * @returns CSS style object with gradient background
 * 
 * @example
 * ```ts
 * const gradientStyle = createGradientStyle('#3b82f6', 'to-br', 'medium');
 * // Returns: { background: 'linear-gradient(to bottom right, #3b82f6, #60a5fa)' }
 * ```
 */
export function createGradientStyle(
  baseColor: string,
  direction: 'to-r' | 'to-br' | 'to-b' | 'to-bl' | 'to-l' | 'to-tl' | 'to-t' | 'to-tr' = 'to-br',
  intensity: 'light' | 'medium' | 'strong' = 'medium'
): React.CSSProperties {
  if (!baseColor) {
    return {};
  }

  // Convert hex to RGB for manipulation
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Lighten color
  const lightenColor = (color: string, amount: number) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount));
    const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount));
    const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount));
    
    return rgbToHex(r, g, b);
  };

  // Darken color
  const darkenColor = (color: string, amount: number) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    const r = Math.max(0, Math.floor(rgb.r * (1 - amount)));
    const g = Math.max(0, Math.floor(rgb.g * (1 - amount)));
    const b = Math.max(0, Math.floor(rgb.b * (1 - amount)));
    
    return rgbToHex(r, g, b);
  };

  // Define intensity levels
  const intensityMap = {
    light: 0.15,
    medium: 0.25,
    strong: 0.4
  };

  const amount = intensityMap[intensity];
  const lightColor = lightenColor(baseColor, amount);
  const darkColor = darkenColor(baseColor, amount * 0.5);

  // Convert direction to CSS gradient direction
  const directionMap = {
    'to-r': 'to right',
    'to-br': 'to bottom right',
    'to-b': 'to bottom',
    'to-bl': 'to bottom left',
    'to-l': 'to left',
    'to-tl': 'to top left',
    'to-t': 'to top',
    'to-tr': 'to top right'
  };

  const cssDirection = directionMap[direction];

  return {
    background: `linear-gradient(${cssDirection}, ${baseColor}, ${lightColor}, ${darkColor})`
  };
}

/**
 * Creates a subtle gradient overlay style for cards and containers
 * 
 * @param baseColor - Base color in hex format
 * @returns CSS style object with gradient overlay
 */
export function createCardGradientStyle(baseColor: string): React.CSSProperties {
  if (!baseColor) {
    return {};
  }

  // Convert hex to RGB for proper alpha transparency
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(baseColor);
  if (!rgb) {
    return {};
  }

  const { r, g, b } = rgb;

  return {
    background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.15), rgba(${r}, ${g}, ${b}, 0.05), rgba(${r}, ${g}, ${b}, 0.10))`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.40)`
  };
}