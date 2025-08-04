import React, { createContext, useContext } from 'react';

export interface FormErrorConfig {
  /** When to show validation errors */
  timing: 'touched' | 'dirty' | 'immediate' | 'validation-mode';
  /** Show fallback messages for validation errors */
  showFallbackMessages: boolean;
  /** Merge external errors with validation errors */
  mergeExternalErrors: boolean;
  /** Auto-clear external errors when user starts typing */
  autoClearExternalErrors: boolean;
}

export interface FormConfig {
  errorDisplay: FormErrorConfig;
}

const defaultFormConfig: FormConfig = {
  errorDisplay: {
    timing: 'validation-mode',
    showFallbackMessages: true,
    mergeExternalErrors: true,
    autoClearExternalErrors: true,
  },
};

const FormConfigContext = createContext<FormConfig>(defaultFormConfig);

interface FormConfigProviderProps {
  children: React.ReactNode;
  config?: Partial;
}

export const FormConfigProvider = ({ children, config }: FormConfigProviderProps) => {
  const mergedConfig: FormConfig = {
    errorDisplay: {
      ...defaultFormConfig.errorDisplay,
      ...config?.errorDisplay,
    },
  };

  return <FormConfigContext.Provider value={mergedConfig}>{children}</FormConfigContext.Provider>;
};

export const useFormConfig = () => {
  return useContext(FormConfigContext);
};
