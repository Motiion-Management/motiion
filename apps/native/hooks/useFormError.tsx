import React, { createContext, useCallback, useContext, useState } from 'react';

interface FormErrorContextValue {
  externalErrors: Record<string, string>;
  setExternalError: (field: string, error: string | null) => void;
  clearExternalErrors: () => void;
  clearExternalError: (field: string) => void;
}

const FormErrorContext = createContext<FormErrorContextValue | null>(null);

export const FormErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [externalErrors, setExternalErrors] = useState<Record<string, string>>({});

  const setExternalError = useCallback((field: string, error: string | null) => {
    setExternalErrors((prev) => {
      if (error === null) {
        const { [field]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: error };
    });
  }, []);

  const clearExternalError = useCallback((field: string) => {
    setExternalErrors((prev) => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearExternalErrors = useCallback(() => {
    setExternalErrors({});
  }, []);

  return (
    <FormErrorContext.Provider
      value={{
        externalErrors,
        setExternalError,
        clearExternalErrors,
        clearExternalError,
      }}>
      {children}
    </FormErrorContext.Provider>
  );
};

export const useFormError = () => {
  const context = useContext(FormErrorContext);
  if (!context) {
    throw new Error('useFormError must be used within a FormErrorProvider');
  }
  return context;
};

// Safe version that returns null when not in provider
export const useFormErrorSafe = () => {
  return useContext(FormErrorContext);
};

export const useExternalFieldError = (fieldName: string) => {
  const { externalErrors, clearExternalError } = useFormError();

  const externalError = externalErrors[fieldName];

  const clearError = useCallback(() => {
    clearExternalError(fieldName);
  }, [clearExternalError, fieldName]);

  return {
    externalError,
    clearError,
    hasExternalError: !!externalError,
  };
};

// Safe version that works without provider
export const useExternalFieldErrorSafe = (fieldName: string) => {
  const context = useFormErrorSafe();

  const externalError = context?.externalErrors[fieldName];

  const clearError = useCallback(() => {
    context?.clearExternalError(fieldName);
  }, [context, fieldName]);

  return {
    externalError,
    clearError,
    hasExternalError: !!externalError,
  };
};
