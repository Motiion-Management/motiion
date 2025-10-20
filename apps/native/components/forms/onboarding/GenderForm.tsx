import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useStore } from '@tanstack/react-form';
import {
  genderFormSchema,
  type GenderFormValues,
  GENDER,
} from '@packages/backend/convex/schemas/fields';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

// Backward compatibility export
export const genderSchema = genderFormSchema;

export type GenderValues = GenderFormValues;

export const GenderForm = forwardRef<FormHandle, FormProps<GenderValues>>(function GenderForm(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onChange: genderSchema },
    onSubmit: async ({ value }) => onSubmit(value),
  });

  const isValid = useStore(form.store, (s: any) => s.canSubmit && !s.isSubmitting);

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
    isDirty: () => !!useStore(form.store, (s: any) => s.isDirty),
    isValid: () => !!isValid,
  }));

  useEffect(() => {
    onValidChange?.(!!isValid);
  }, [isValid, onValidChange]);

  const options = GENDER.map((g) => ({ value: g, label: g }));

  return (
    <ValidationModeForm form={form}>
      <form.AppField
        name="gender"
        children={(field: any) => <field.RadioGroupField options={options} />}
      />
    </ValidationModeForm>
  );
});
