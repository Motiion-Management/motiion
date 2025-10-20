import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import * as z from 'zod';
import { useStore } from '@tanstack/react-form';
import {
  sagAftraIdFormSchema,
  type SagAftraIdFormValues,
} from '@packages/backend/convex/schemas/fields';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

// Note: This form validates optional sagAftraId, while shared schema requires it
// Using a local schema that makes it optional for this specific use case
const unionSchema = z.object({
  sagAftraId: z.string().optional(),
});

export type UnionValues = z.infer<typeof unionSchema>;

// Export shared schema for reference
export { sagAftraIdFormSchema };

export const UnionForm = forwardRef<FormHandle, FormProps<UnionValues>>(function UnionForm(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onChange: unionSchema },
    onSubmit: async ({ value }) => onSubmit(value),
  });

  const canProgress = useStore(form.store, (s) => s.canSubmit);

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
    isDirty: () => !!useStore(form.store, (s) => s.isDirty),
    isValid: () => !!canProgress && !form.state.isSubmitting,
  }));

  useEffect(() => {
    onValidChange?.(!!canProgress && !form.state.isSubmitting);
  }, [canProgress, form.state.isSubmitting, onValidChange]);

  return (
    <ValidationModeForm form={form}>
      <form.AppField
        name="sagAftraId"
        children={(field: any) => (
          <field.InputField
            label="MEMBER ID"
            placeholder="12345678"
            keyboardType="numeric"
            autoCapitalize="none"
          />
        )}
      />
    </ValidationModeForm>
  );
});
