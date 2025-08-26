import React, { forwardRef, useMemo, useEffect } from 'react'
import { View } from 'react-native'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

import { TrainingCard } from '~/components/training/TrainingCard'
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

export interface TrainingFormData {
  training: any[]
}

export const TrainingForm = forwardRef<OnboardingFormRef, OnboardingFormProps<TrainingFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const onboarding = useSimpleOnboardingFlow()
    const training = useQuery(api.training.getMyTraining, {})

    const slots = useMemo(() => {
      const docs = training || []
      return [docs[0] || null, docs[1] || null, docs[2] || null] as (any | null)[]
    }, [training])

    const firstEmptyIndex = useMemo(() => slots.findIndex((s) => !s), [slots])

    // All training fields are optional, so we can always progress
    const canProgress = true

    // Notify parent of validation state changes
    useEffect(() => {
      onValidationChange?.(canProgress)
    }, [canProgress, onValidationChange])

    const handleSubmit = async () => {
      // Training is saved via TrainingCard components
      await onComplete({ training: training || [] })
    }

    const handleSkip = () => {
      onboarding.navigateNext()
      onComplete({ training: [] })
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Add your training"
        description="Add up to 3 training details. People commonly include dance teams, schools, and training programs."
        canProgress={canProgress}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        secondaryAction={
          !training?.length
            ? {
                text: 'Skip for now',
                onPress: handleSkip,
              }
            : undefined
        }>
        
        <View className="flex-1 gap-4">
          {slots.map((tr, index) => {
            const isCompleted = !!tr
            const isDisabled = !tr && firstEmptyIndex !== -1 && index !== firstEmptyIndex
            const variant: 'completed' | 'default' | 'disabled' = isCompleted
              ? 'completed'
              : isDisabled
                ? 'disabled'
                : 'default'
            return (
              <TrainingCard
                key={tr?._id ?? `slot-${index}`}
                training={tr || undefined}
                trainingId={tr?._id}
                placeholder={`Training ${index + 1}`}
                variant={variant}
                disabled={isDisabled}
              />
            )
          })}
        </View>
      </BaseOnboardingForm>
    )
  }
)

TrainingForm.displayName = 'TrainingForm'