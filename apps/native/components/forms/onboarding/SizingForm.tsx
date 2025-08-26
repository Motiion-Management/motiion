import React, { forwardRef, useEffect } from 'react'

import { SizingSection } from '~/components/sizing/SizingSection'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

export interface SizingFormData {
  sizing: any
}

export const SizingForm = forwardRef<OnboardingFormRef, OnboardingFormProps<SizingFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    
    // All sizing fields are optional, so we can always progress
    const canProgress = true

    // Notify parent of validation state changes
    useEffect(() => {
      onValidationChange?.(canProgress)
    }, [canProgress, onValidationChange])

    const handleSubmit = async () => {
      // Sizing is saved automatically by SizingSection components
      await onComplete({ sizing: {} })
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Size Card"
        description="Optional - Not all sizing metrics may apply to you. Only input what is relevant to you."
        canProgress={canProgress}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        
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
      </BaseOnboardingForm>
    )
  }
)

SizingForm.displayName = 'SizingForm'