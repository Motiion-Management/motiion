import React, { ReactNode } from 'react';

import { ValidationModeProvider, useValidationModeContext } from '~/hooks/useValidationMode';

interface ValidationModeFormProps {
  children: ReactNode;
  form: any; // Using any for now to avoid complex TanStack Form type issues
}

// Inner component that has access to validation mode context
const ValidationModeFormInner = ({ children, form }: ValidationModeFormProps) => {
  const { markFormSubmitted } = useValidationModeContext();

  // Intercept form submit to mark form as submitted
  React.useEffect(() => {
    const originalOnSubmit = form.options.onSubmit;

    form.options.onSubmit = async (submissionApi: any) => {
      markFormSubmitted();
      if (originalOnSubmit) {
        return originalOnSubmit(submissionApi);
      }
    };

    return () => {
      form.options.onSubmit = originalOnSubmit;
    };
  }, [form, markFormSubmitted]);

  return <>{children}</>;
};

// Main component that provides the validation mode context
export const ValidationModeForm = ({ children, form }: ValidationModeFormProps) => {
  return (
    <ValidationModeProvider>
      <ValidationModeFormInner form={form}>{children}</ValidationModeFormInner>
    </ValidationModeProvider>
  );
};
