import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import {
  sizingFormSchema,
  type SizingFormValues
} from '@packages/backend/convex/schemas/fields';

import { SizingSection } from '~/components/sizing/SizingSection';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

// Backward compatibility export
export const sizingSchema = sizingFormSchema;

export interface SizingValues {
  // Placeholder; sizing sections manage their own persistence
  // The shared schema type is available as SizingFormValues
}

export const SizingForm = forwardRef<FormHandle, FormProps<SizingValues>>(function SizingForm(
  { onSubmit, onValidChange },
  ref
) {
  useImperativeHandle(ref, () => ({
    submit: () => onSubmit({}),
    isDirty: () => false,
    isValid: () => true,
  }));

  useEffect(() => {
    onValidChange?.(true);
  }, [onValidChange]);

  return (
    <>
      <SizingSection title="General" metrics={['waist', 'inseam', 'glove', 'hat']} />
      <SizingSection
        title="Men"
        metrics={['chest', 'neck', 'sleeve', 'maleShirt', 'maleShoes', 'maleCoatLength']}
      />
      <SizingSection
        title="Women"
        metrics={[
          'dress',
          'bust',
          'underbust',
          'cup',
          'hip',
          'femaleShirt',
          'pants',
          'femaleShoes',
          'femaleCoatLength',
        ]}
      />
    </>
  );
});
