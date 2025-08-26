import React, { forwardRef, useEffect, useImperativeHandle } from 'react'

import { SizingSection } from '~/components/sizing/SizingSection'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

export interface SizingValues {
  // Placeholder; sizing sections manage their own persistence
}

export const SizingForm = forwardRef<FormHandle, FormProps<SizingValues>>(function SizingForm(
  { onSubmit, onValidChange },
  ref
) {
  useImperativeHandle(ref, () => ({
    submit: () => onSubmit({}),
    isDirty: () => false,
    isValid: () => true,
  }))

  useEffect(() => {
    onValidChange?.(true)
  }, [onValidChange])

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
  )
})

