import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useStore } from '@tanstack/react-form';
import {
  hairColorFormSchema,
  type HairColorFormValues,
  HAIR_COLOR,
} from '@packages/backend/convex/schemas/fields';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

// Backward compatibility export
export const hairColorSchema = hairColorFormSchema;

export type HairColorValues = HairColorFormValues;

export const HairColorForm = forwardRef<FormHandle, FormProps<HairColorValues>>(
  function HairColorForm({ initialValues, onSubmit, onValidChange }, ref) {
    const form = useAppForm({
      defaultValues: initialValues,
      validators: { onChange: hairColorSchema },
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

    const options = HAIR_COLOR.map((c) => ({ value: c, label: c }));

    return (
      <ValidationModeForm form={form}>
        <form.AppField
          name="hairColor"
          children={(field: any) => <field.RadioGroupField options={options} />}
        />
      </ValidationModeForm>
    );
  }
);
