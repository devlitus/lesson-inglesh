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