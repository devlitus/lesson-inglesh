/**
 * FormField Component - Molecule
 * Componente que combina Label, Input y manejo de errores
 */

import React from 'react';
import { Input, Label, type InputProps, type LabelProps } from '../../atoms';
import { cn } from '../../../utils/cn';

export interface FormFieldProps extends Omit<InputProps, 'id' | 'aria-describedby' | 'aria-invalid'> {
  /** Nombre del campo (usado para id y name si no se especifica) */
  name: string;
  /** Etiqueta del campo */
  label?: string;
  /** Propiedades adicionales para la etiqueta */
  labelProps?: Omit<LabelProps, 'htmlFor' | 'children'>;
  /** Descripción o texto de ayuda */
  description?: string;
  /** Mensaje de error */
  error?: string;
  /** Función de validación personalizada */
  validate?: (value: string) => string | undefined;
  /** Validar en tiempo real mientras se escribe */
  validateOnChange?: boolean;
  /** Validar cuando el campo pierde el foco */
  validateOnBlur?: boolean;
  /** Contenedor del campo */
  containerProps?: React.HTMLAttributes<HTMLDivElement> & {
    [key: `data-${string}`]: string;
  };
}

/**
 * Componente FormField que combina etiqueta, input y manejo de errores
 * 
 * @example
 * ```tsx
 * <FormField
 *   name="email"
 *   label="Correo electrónico"
 *   type="email"
 *   required
 *   description="Ingresa tu dirección de correo"
 *   validate={(value) => {
 *     if (!value.includes('@')) return 'Email inválido';
 *   }}
 * />
 * 
 * <FormField
 *   name="password"
 *   label="Contraseña"
 *   type="password"
 *   error="La contraseña debe tener al menos 8 caracteres"
 *   validateOnChange
 * />
 * ```
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      name,
      label,
      labelProps,
      description,
      error: externalError,
      validate,
      validateOnChange = false,
      validateOnBlur = true,
      containerProps,
      onChange,
      onBlur,
      value,
      defaultValue,
      ...inputProps
    },
    ref
  ) => {
    // Estado interno para errores de validación
    const [internalError, setInternalError] = React.useState<string | undefined>();
    const [hasBlurred, setHasBlurred] = React.useState(false);
    
    // El error final es el externo o el interno
    const finalError = externalError || internalError;
    
    // IDs únicos
    const fieldId = React.useId();
    const inputId = `${fieldId}-input`;
    const descriptionId = description ? `${fieldId}-description` : undefined;
    const errorId = finalError ? `${fieldId}-error` : undefined;

    // Función de validación
    const runValidation = React.useCallback(
      (currentValue: string) => {
        if (!validate) return;
        
        const validationError = validate(currentValue);
        setInternalError(validationError);
      },
      [validate]
    );

    // Manejar cambios
    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        
        // Llamar al onChange externo
        onChange?.(event);
        
        // Validar si está habilitado y ya se ha hecho blur al menos una vez
        if (validateOnChange && (hasBlurred || validateOnChange)) {
          runValidation(newValue);
        }
      },
      [onChange, validateOnChange, hasBlurred, runValidation]
    );

    // Manejar blur
    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setHasBlurred(true);
        
        // Llamar al onBlur externo
        onBlur?.(event);
        
        // Validar si está habilitado
        if (validateOnBlur) {
          runValidation(event.target.value);
        }
      },
      [onBlur, validateOnBlur, runValidation]
    );

    // Validar valor inicial si hay un validate y defaultValue
    React.useEffect(() => {
      if (validate && defaultValue && typeof defaultValue === 'string') {
        runValidation(defaultValue);
      }
    }, [validate, defaultValue, runValidation]);

    return (
      <div
        {...containerProps}
        className={cn('space-y-1', containerProps?.className)}
      >
        {/* Etiqueta */}
        {label && (
          <Label
            htmlFor={inputId}
            required={inputProps.required}
            variant={finalError ? 'error' : 'default'}
            {...labelProps}
          >
            {label}
          </Label>
        )}

        {/* Descripción */}
        {description && (
          <p
            id={descriptionId}
            className="text-sm text-gray-600"
          >
            {description}
          </p>
        )}

        {/* Input */}
        <Input
          ref={ref}
          id={inputId}
          name={name}
          error={finalError}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-describedby={cn(
            descriptionId,
            errorId
          )}
          {...inputProps}
        />
      </div>
    );
  }
);

FormField.displayName = 'FormField';