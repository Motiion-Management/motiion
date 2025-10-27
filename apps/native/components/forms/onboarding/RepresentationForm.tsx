import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import * as z from 'zod';
import { useStore } from '@tanstack/react-form';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

// This form handles representationStatus specifically (a simpler onboarding question)
// The full representation object (with agency selection) would be a separate, more complex form
// The shared representationFormSchema from @packages/backend is available for future agency selection forms
const representationStatusSchema = z.object({
  representationStatus: z.enum(['represented', 'seeking', 'independent'], {
    message: 'Please select your representation status',
  }),
});

// Backward compatibility exports
export const representationSchema = representationStatusSchema;
export type RepresentationValues = z.infer<typeof representationStatusSchema>;

// Note: The shared RepresentationFormValues type from backend is available for future use

const options = [
  { value: 'represented', label: "Yes, I'm represented" },
  { value: 'seeking', label: 'No, but looking for representation' },
  { value: 'independent', label: "No, I'm an independent artist" },
];

export const RepresentationForm = forwardRef<FormHandle, FormProps<RepresentationValues>>(
  function RepresentationForm({ initialValues, onSubmit, onValidChange }, ref) {
    const form = useAppForm({
      defaultValues: initialValues,
      validators: { onChange: representationSchema },
      onSubmit: async ({ value }) => onSubmit(value),
    });

    const isValid = useStore(form.store, (s) => s.canSubmit && !s.isSubmitting);

    useImperativeHandle(ref, () => ({
      submit: () => form.handleSubmit(),
      isDirty: () => !!useStore(form.store, (s) => s.isDirty),
      isValid: () => !!isValid,
    }));

    useEffect(() => {
      onValidChange?.(!!isValid);
    }, [isValid, onValidChange]);

    return (
      <ValidationModeForm form={form}>
        <form.AppField
          name="representationStatus"
          children={(field: any) => <field.RadioGroupField options={options} />}
        />
      </ValidationModeForm>
    );
  }
);
