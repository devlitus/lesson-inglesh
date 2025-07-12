/**
 * Tests para las utilidades de clases CSS (cn y funciones relacionadas)
 * Verifica el correcto funcionamiento del sistema de clases del design system
 */

import { describe, test, expect } from 'vitest';
import { cn, cnMerge, createClassBuilder, cond, responsive, createGradientStyle } from '../cn';

describe('CN Utility Functions', () => {
  describe('cn (main function)', () => {
    test('should combine string classes correctly', () => {
      // Act
      const result = cn('class1', 'class2', 'class3');

      // Assert
      expect(result).toBe('class1 class2 class3');
    });

    test('should filter out falsy values', () => {
      // Act
      const result = cn('class1', null, undefined, false, '', 'class2', 0, 'class3');

      // Assert
      expect(result).toBe('class1 class2 class3');
    });

    test('should handle number values', () => {
      // Act
      const result = cn('class1', 42, 'class2');

      // Assert
      expect(result).toBe('class1 42 class2');
    });

    test('should handle array values recursively', () => {
      // Act
      const result = cn('base', ['array1', 'array2'], 'end');

      // Assert
      expect(result).toBe('base array1 array2 end');
    });

    test('should handle nested arrays', () => {
      // Act
      const result = cn('base', ['level1', ['level2', 'level3']], 'end');

      // Assert
      expect(result).toBe('base level1 level2 level3 end');
    });

    test('should handle object values with truthy/falsy conditions', () => {
      // Act
      const result = cn('base', {
        'active': true,
        'disabled': false,
        'primary': 1,
        'secondary': 0,
        'tertiary': 'truthy',
        'quaternary': ''
      });

      // Assert
      expect(result).toBe('base active primary tertiary');
    });

    test('should handle mixed types', () => {
      // Act
      const result = cn(
        'base',
        ['array-class'],
        { 'object-class': true, 'hidden': false },
        null,
        'end-class'
      );

      // Assert
      expect(result).toBe('base array-class object-class end-class');
    });

    test('should return empty string for all falsy values', () => {
      // Act
      const result = cn(null, undefined, false, '', 0);

      // Assert
      expect(result).toBe('');
    });

    test('should handle empty arrays', () => {
      // Act
      const result = cn('base', [], 'end');

      // Assert
      expect(result).toBe('base end');
    });

    test('should handle empty objects', () => {
      // Act
      const result = cn('base', {}, 'end');

      // Assert
      expect(result).toBe('base end');
    });
  });

  describe('cnMerge', () => {
    test('should combine and deduplicate classes', () => {
      // Act
      const result = cnMerge('class1', 'class2', 'class1', 'class3', 'class2');

      // Assert
      expect(result).toBe('class1 class2 class3');
    });

    test('should handle complex deduplication', () => {
      // Act
      const result = cnMerge(
        'btn btn-primary',
        'btn btn-large',
        { 'btn': true, 'active': true }
      );

      // Assert
      expect(result).toBe('btn btn-primary btn-large active');
    });

    test('should preserve order of first occurrence', () => {
      // Act
      const result = cnMerge('z-class', 'a-class', 'z-class', 'm-class');

      // Assert
      expect(result).toBe('z-class a-class m-class');
    });
  });

  describe('createClassBuilder', () => {
    test('should create a function that combines base classes with additional ones', () => {
      // Arrange
      const buttonBuilder = createClassBuilder('btn', 'inline-flex', 'items-center');

      // Act
      const result = buttonBuilder('bg-blue-500', 'text-white');

      // Assert
      expect(result).toBe('btn inline-flex items-center bg-blue-500 text-white');
    });

    test('should handle empty additional classes', () => {
      // Arrange
      const builder = createClassBuilder('base-class');

      // Act
      const result = builder();

      // Assert
      expect(result).toBe('base-class');
    });

    test('should handle complex base classes', () => {
      // Arrange
      const builder = createClassBuilder(
        'component',
        ['flex', 'items-center'],
        { 'rounded': true, 'shadow': false }
      );

      // Act
      const result = builder('text-sm', 'p-2');

      // Assert
      expect(result).toBe('component flex items-center rounded text-sm p-2');
    });

    test('should create independent builders', () => {
      // Arrange
      const buttonBuilder = createClassBuilder('btn');
      const cardBuilder = createClassBuilder('card');

      // Act
      const buttonResult = buttonBuilder('btn-primary');
      const cardResult = cardBuilder('card-elevated');

      // Assert
      expect(buttonResult).toBe('btn btn-primary');
      expect(cardResult).toBe('card card-elevated');
    });
  });

  describe('cond (conditional classes)', () => {
    test('should return true classes when condition is true', () => {
      // Act
      const result = cond(true, 'active-class', 'inactive-class');

      // Assert
      expect(result).toBe('active-class');
    });

    test('should return false classes when condition is false', () => {
      // Act
      const result = cond(false, 'active-class', 'inactive-class');

      // Assert
      expect(result).toBe('inactive-class');
    });

    test('should return empty string when condition is false and no false classes provided', () => {
      // Act
      const result = cond(false, 'active-class');

      // Assert
      expect(result).toBe('');
    });

    test('should handle complex class values', () => {
      // Act
      const result = cond(
        true,
        ['active', 'primary'],
        { 'inactive': true, 'secondary': true }
      );

      // Assert
      expect(result).toBe('active primary');
    });

    test('should handle truthy/falsy values correctly', () => {
      // Assert
      expect(cond(1, 'truthy', 'falsy')).toBe('truthy');
      expect(cond(0, 'truthy', 'falsy')).toBe('falsy');
      expect(cond('string', 'truthy', 'falsy')).toBe('truthy');
      expect(cond('', 'truthy', 'falsy')).toBe('falsy');
      expect(cond([], 'truthy', 'falsy')).toBe('truthy'); // Arrays are truthy
      expect(cond({}, 'truthy', 'falsy')).toBe('truthy'); // Objects are truthy
    });
  });

  describe('responsive', () => {
    test('should combine responsive classes from object values', () => {
      // Act
      const result = responsive({
        base: 'text-sm',
        md: 'md:text-base',
        lg: 'lg:text-lg'
      });

      // Assert
      expect(result).toBe('text-sm md:text-base lg:text-lg');
    });

    test('should handle complex responsive values', () => {
      // Act
      const result = responsive({
        mobile: ['text-xs', 'p-2'],
        tablet: { 'md:text-sm': true, 'md:p-4': true },
        desktop: 'lg:text-base lg:p-6'
      });

      // Assert
      expect(result).toBe('text-xs p-2 md:text-sm md:p-4 lg:text-base lg:p-6');
    });

    test('should handle empty responsive object', () => {
      // Act
      const result = responsive({});

      // Assert
      expect(result).toBe('');
    });

    test('should filter out falsy responsive values', () => {
      // Act
      const result = responsive({
        base: 'text-sm',
        md: null,
        lg: undefined,
        xl: false,
        '2xl': 'text-xl'
      });

      // Assert
      expect(result).toBe('text-sm text-xl');
    });
  });

  describe('createGradientStyle', () => {
    test('should create gradient style with default parameters', () => {
      // Act
      const result = createGradientStyle('#3b82f6');

      // Assert
      expect(result).toHaveProperty('background');
      expect(result.background).toContain('linear-gradient');
      expect(result.background).toContain('to bottom right');
      expect(result.background).toContain('#3b82f6');
    });

    test('should handle different gradient directions', () => {
      // Act
      const resultToR = createGradientStyle('#ff0000', 'to-r');
      const resultToB = createGradientStyle('#00ff00', 'to-b');
      const resultToL = createGradientStyle('#0000ff', 'to-l');

      // Assert
      expect(resultToR.background).toContain('to right');
      expect(resultToB.background).toContain('to bottom');
      expect(resultToL.background).toContain('to left');
    });

    test('should handle different intensity levels', () => {
      // Act
      const lightResult = createGradientStyle('#3b82f6', 'to-br', 'light');
      const mediumResult = createGradientStyle('#3b82f6', 'to-br', 'medium');
      const strongResult = createGradientStyle('#3b82f6', 'to-br', 'strong');

      // Assert
      expect(lightResult).toHaveProperty('background');
      expect(mediumResult).toHaveProperty('background');
      expect(strongResult).toHaveProperty('background');
      
      // All should contain the base color
      expect(lightResult.background).toContain('#3b82f6');
      expect(mediumResult.background).toContain('#3b82f6');
      expect(strongResult.background).toContain('#3b82f6');
    });

    test('should return empty object for invalid color', () => {
      // Act
      const result = createGradientStyle('');

      // Assert
      expect(result).toEqual({});
    });

    test('should handle 3-character hex colors', () => {
      // Act
      const result = createGradientStyle('#f00');

      // Assert
      // The function still creates a gradient even with 3-char hex (uses original color)
      expect(result).toHaveProperty('background');
      expect(result.background).toContain('#f00');
    });

    test('should handle uppercase hex colors', () => {
      // Act
      const result = createGradientStyle('#FF0000');

      // Assert
      expect(result).toHaveProperty('background');
      expect(result.background).toContain('#FF0000');
    });
  });

  describe('integration scenarios', () => {
    test('should work together in complex component scenarios', () => {
      // Arrange
      const isActive = true;
      const size = 'large';
      const variant = 'primary';
      
      const buttonBuilder = createClassBuilder('btn', 'inline-flex', 'items-center');
      
      // Act
      const classes = buttonBuilder(
        cond(isActive, 'active', 'inactive'),
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
          'btn-large': size === 'large',
          'btn-small': size === 'small'
        },
        responsive({
          base: 'text-sm',
          md: 'md:text-base'
        })
      );

      // Assert
      expect(classes).toBe('btn inline-flex items-center active btn-primary btn-large text-sm md:text-base');
    });

    test('should handle performance with many classes', () => {
      // Arrange
      const manyClasses = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      
      // Act
      const start = performance.now();
      const result = cn(...manyClasses);
      const end = performance.now();
      
      // Assert
      expect(result).toContain('class-0');
      expect(result).toContain('class-99');
      expect(end - start).toBeLessThan(10); // Should be very fast
    });

    test('should maintain consistency across multiple calls', () => {
      // Arrange
      const classes = ['btn', { 'active': true }, ['flex', 'items-center']];
      
      // Act
      const result1 = cn(...classes);
      const result2 = cn(...classes);
      const result3 = cn(...classes);
      
      // Assert
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe('btn active flex items-center');
    });
  });
});