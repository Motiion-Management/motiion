import React from 'react';

import { FormConfigProvider, type FormConfig } from '~/hooks/useFormConfig';
import { FormErrorProvider } from '~/hooks/useFormError';

interface FormProviderProps {
  children: React.ReactNode;
  config?: Partial;
}

export const FormProvider = ({ children, config }: FormProviderProps) => {
  return (
    <FormConfigProvider config={config}>
      <FormErrorProvider>{children}</FormErrorProvider>
    </FormConfigProvider>
  );
};
