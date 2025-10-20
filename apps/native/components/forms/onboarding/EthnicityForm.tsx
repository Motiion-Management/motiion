import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useStore } from '@tanstack/react-form';
import {
  ethnicityFormSchema,
  type EthnicityFormValues,
  ETHNICITY,
} from '@packages/backend/convex/schemas/fields';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

// Backward compatibility export
export const ethnicitySchema = ethnicityFormSchema;

export type EthnicityValues = EthnicityFormValues;

export const EthnicityForm = forwardRef<FormHandle, FormProps<EthnicityValues>>(
  function EthnicityForm({ initialValues, onSubmit, onValidChange }, ref) {
    const form = useAppForm({
      defaultValues: initialValues,
      validators: { onChange: ethnicitySchema },
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

    const options = ETHNICITY.map((e) => ({ value: e, label: e }));

    return (
      <ValidationModeForm form={form}>
        <form.AppField
          name="ethnicity"
          children={(field: any) => <field.CheckboxGroupField options={options} />}
        />
      </ValidationModeForm>
    );
  }
);
