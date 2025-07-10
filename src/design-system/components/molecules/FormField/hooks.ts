/**
 * FormField Hooks and Utilities
 * Hooks y utilidades para el componente FormField
 */

import React from 'react';

/**
 * Hook para manejar múltiples campos de formulario
 */
export interface UseFormFieldsOptions {
  /** Valores iniciales */
  initialValues?: Record<string, unknown>;
  /** Funciones de validación por campo */
  validators?: Record<string, (value: unknown) => string | undefined>;
  /** Validar en tiempo real */
  validateOnChange?: boolean;
}

export function useFormFields(options: UseFormFieldsOptions = {}) {
  const {
    initialValues = {},
    validators = {},
    validateOnChange = false
  } = options;

  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  // Actualizar valor de un campo
  const setValue = React.useCallback((name: string, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validar si está habilitado y el campo ya fue tocado
    if (validateOnChange && touched[name] && validators[name]) {
      const error = validators[name](value);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  }, [validateOnChange, touched, validators]);

  // Marcar campo como tocado y validar
  const setFieldTouched = React.useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validators[name]) {
      const error = validators[name](values[name]);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  }, [validators, values]);

  // Validar todos los campos
  const validateAll = React.useCallback(() => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    Object.keys(validators).forEach(name => {
      const error = validators[name](values[name]);
      if (error) {
        newErrors[name] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [validators, values]);

  // Reset del formulario
  const reset = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched: setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}