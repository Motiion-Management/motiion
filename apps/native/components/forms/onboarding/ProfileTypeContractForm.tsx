import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

export const profileTypeSchema = z.object({
  profileType: z.enum(['dancer', 'choreographer'], {
    message: 'Please select a profile type',
  }),
});

export type ProfileTypeValues = z.infer<typeof profileTypeSchema>;

const options = [
  { value: 'dancer', label: 'Dancer' },
  { value: 'choreographer', label: 'Choreographer' },
];

export const ProfileTypeContractForm = forwardRef<FormHandle, FormProps<ProfileTypeValues>>(
  function ProfileTypeContractForm({ initialValues, onSubmit, onValidChange }, ref) {
    const form = useAppForm({
      defaultValues: initialValues as any,
      validators: { onChange: profileTypeSchema },
      onSubmit: async ({ value }) => onSubmit(value as any),
    });

    useImperativeHandle(ref, () => ({
      submit: () => form.handleSubmit(),
      isDirty: () => !!form.store.state.isDirty,
      isValid: () => !!(form.store.state.canSubmit && !form.store.state.isSubmitting),
    }));

    useEffect(() => {
      onValidChange?.(form.store.state.canSubmit && !form.store.state.isSubmitting);
    }, [onValidChange, form.store.state.canSubmit, form.store.state.isSubmitting]);

    return (
      <ValidationModeForm form={form}>
        <form.AppField
          name="profileType"
          children={(field: any) => <field.RadioGroupField options={options} />}
        />
      </ValidationModeForm>
    );
  }
);

ProfileTypeContractForm.displayName = 'ProfileTypeContractForm';
