import type { FieldApi } from '@tanstack/react-form';
import { useCallback, useRef, useState, createContext, useContext, ReactNode } from 'react';

interface ValidationModeState {
  hasBlurred: Set<string>;
  hasSubmitted: boolean;
}

export const useValidationMode = () => {
  const [state, setState] = useState<ValidationModeState>({
    hasBlurred: new Set(),
    hasSubmitted: false,
  });

  const markFieldBlurred = useCallback((fieldName: string) => {
    setState((prev) => ({
      ...prev,
      hasBlurred: new Set([...prev.hasBlurred, fieldName]),
    }));
  }, []);

  const markFormSubmitted = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hasSubmitted: true,
    }));
  }, []);

  const shouldShowValidation = useCallback(
    (fieldName: string) => {
      return state.hasSubmitted || state.hasBlurred.has(fieldName);
    },
    [state.hasSubmitted, state.hasBlurred]
  );

  const reset = useCallback(() => {
    setState({
      hasBlurred: new Set(),
      hasSubmitted: false,
    });
  }, []);

  return {
    markFieldBlurred,
    markFormSubmitted,
    shouldShowValidation,
    reset,
  };
};

// Context to share validation mode across form components

interface ValidationModeContextValue {
  markFieldBlurred: (fieldName: string) => void;
  markFormSubmitted: () => void;
  shouldShowValidation: (fieldName: string) => boolean;
  reset: () => void;
}

const ValidationModeContext = createContext<ValidationModeContextValue | undefined>(undefined);

export const ValidationModeProvider = ({ children }: { children: ReactNode }) => {
  const validationMode = useValidationMode();

  return (
    <ValidationModeContext.Provider value={validationMode}>
      {children}
    </ValidationModeContext.Provider>
  );
};

export const useValidationModeContext = () => {
  const context = useContext(ValidationModeContext);
  if (!context) {
    throw new Error('useValidationModeContext must be used within ValidationModeProvider');
  }
  return context;
};

// Safe version that returns null when not in provider
export const useValidationModeContextSafe = () => {
  return useContext(ValidationModeContext);
};
