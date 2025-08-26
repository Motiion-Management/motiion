import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { router } from 'expo-router'
import React, { forwardRef, useEffect } from 'react'
import * as z from 'zod'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { OnboardingFormProps, OnboardingFormRef } from './types'

export interface RepresentationFormData {
  representationStatus: 'represented' | 'seeking' | 'independent'
}

const representationStatusOptions = [
  { value: 'represented', label: "Yes, I'm represented" },
  { value: 'seeking', label: 'No, but looking for representation' },
  { value: 'independent', label: "No, I'm an independent artist" },
]

const representationValidator = z.object({
  representationStatus: z.enum(['represented', 'seeking', 'independent'], {
    required_error: 'Please select your representation status',
  }),
})

export const RepresentationForm = forwardRef<OnboardingFormRef, OnboardingFormProps<RepresentationFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const updateUser = useMutation(api.users.updateMyUser)
    const user = useQuery(api.users.getMyUser)
    const nav = useSimpleOnboardingFlow()

    const form = useAppForm({
      defaultValues: {
        representationStatus: initialData?.representationStatus || user?.representationStatus,
      },
      validators: {
        onChange: representationValidator,
      },
      onSubmit: async ({ value }) => {
        if (!value.representationStatus) return

        await updateUser({
          representationStatus: value.representationStatus,
        })

        await onComplete({ representationStatus: value.representationStatus })

        // If represented, navigate to agency screen
        if (value.representationStatus === 'represented') {
          router.push('/app/onboarding/work-details/agency')
        }
      },
    })

    // Notify parent of validation state changes
    useEffect(() => {
      onValidationChange?.(form.state.canSubmit && !form.state.isSubmitting)
    }, [form.state.canSubmit, form.state.isSubmitting, onValidationChange])

    return (
      <BaseOnboardingScreen
        title="Are you represented by an agent?"
        description="Select one"
        canProgress={form.state.canSubmit && !form.state.isSubmitting}
        primaryAction={{
          onPress: () => form.handleSubmit(),
          handlesNavigation: true,
        }}
        secondaryAction={{
          onPress: () => {},
          text: 'Requires Verification',
        }}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="representationStatus"
            children={(field) => <field.RadioGroupField options={representationStatusOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    )
  }
)

RepresentationForm.displayName = 'RepresentationForm'