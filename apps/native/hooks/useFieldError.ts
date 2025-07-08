import type { FieldApi } from '@tanstack/react-form';
import { useMemo, useEffect } from 'react';

import { useFormConfig } from './useFormConfig';
import { useExternalFieldErrorSafe } from './useFormError';
import { useValidationModeContextSafe } from './useValidationMode';

interface UseFieldErrorOptions {
  showWhen?: 'touched' | 'dirty' | 'immediate' | 'validation-mode';
  fallbackMessage?: string;
  fieldName?: string;
}

export const useFieldError = (field: FieldApi<any, any>, options: UseFieldErrorOptions = {}) => {
  const formConfig = useFormConfig();
  const { showWhen = formConfig.errorDisplay.timing, fallbackMessage, fieldName } = options;

  const validationModeContext = useValidationModeContextSafe();

  // Always call the hook, but it will return undefined when not needed
  const externalFieldError = useExternalFieldErrorSafe(fieldName || '');

  // Only use external error if mergeExternalErrors is enabled and fieldName exists
  const externalError =
    formConfig.errorDisplay.mergeExternalErrors && fieldName
      ? externalFieldError.externalError
      : undefined;
  const clearExternalError =
    formConfig.errorDisplay.mergeExternalErrors && fieldName
      ? externalFieldError.clearError
      : undefined;

  // Auto-clear external errors when user starts typing
  useEffect(() => {
    if (
      formConfig.errorDisplay.autoClearExternalErrors &&
      externalError &&
      clearExternalError &&
      field.state.meta.isDirty
    ) {
      clearExternalError();
    }
  }, [
    field.state.meta.isDirty,
    externalError,
    clearExternalError,
    formConfig.errorDisplay.autoClearExternalErrors,
  ]);

  const shouldShowError = useMemo(() => {
    const hasError = field.state.meta.errors?.length > 0;
    if (!hasError) return false;

    switch (showWhen) {
      case 'touched':
        return field.state.meta.isTouched;
      case 'dirty':
        return field.state.meta.isDirty;
      case 'immediate':
        return true;
      case 'validation-mode':
        // Use validation mode context if available
        if (validationModeContext && fieldName) {
          return validationModeContext.shouldShowValidation(fieldName);
        }
        // Fallback to touched if no context
        return field.state.meta.isTouched;
      default:
        return field.state.meta.isDirty;
    }
  }, [field.state.meta, showWhen, validationModeContext, fieldName]);

  const errorMessage = useMemo(() => {
    // External errors take priority and always show
    if (externalError) return externalError;

    if (!shouldShowError) return undefined;

    const validationError = field.state.meta.errors?.[0]?.message;
    const shouldUseFallback = formConfig.errorDisplay.showFallbackMessages && !validationError;

    return validationError || (shouldUseFallback ? fallbackMessage : undefined);
  }, [
    externalError,
    shouldShowError,
    field.state.meta.errors,
    fallbackMessage,
    formConfig.errorDisplay.showFallbackMessages,
  ]);

  return {
    hasError: shouldShowError || !!externalError,
    errorMessage,
    isInvalid: field.state.meta.errors?.length > 0,
    clearExternalError,
  };
};
