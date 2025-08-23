import { api } from '@packages/backend/convex/_generated/api'
import { GENDER } from '@packages/backend/convex/validators/attributes'
import { useMutation } from 'convex/react'
import React, { forwardRef, useEffect } from 'react'
import { toast } from 'sonner-native'
import * as z from 'zod'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import { useUser } from '~/hooks/useUser'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

const genderValidator = z.object({
  gender: z.enum(GENDER, {
    required_error: 'Please select your gender',
  }),
})

type GenderSchema = z.infer<typeof genderValidator>

export interface GenderFormData {
  gender: string
}

export const GenderForm = forwardRef<OnboardingFormRef, OnboardingFormProps<GenderFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const patchUserAttributes = useMutation(api.users.patchUserAttributes)
    const { user } = useUser()

    // Get existing value from user
    const existingGender = initialData?.gender || user?.attributes?.gender

    const form = useAppForm({
      defaultValues: {
        gender: existingGender,
      } as GenderSchema,
      validators: {
        onChange: genderValidator,
      },
      onSubmit: async ({ value }) => {
        if (!value.gender) return

        try {
          await patchUserAttributes({
            attributes: { gender: value.gender },
          })

          await onComplete({
            gender: value.gender,
          })
        } catch (error) {
          console.error('Error updating gender:', error)
          toast.error('Failed to update gender. Please try again.')
          throw error
        }
      },
    })

    const radioOptions = GENDER.map((gender) => ({
      value: gender,
      label: gender,
    }))

    const isFormReady = form.state.canSubmit && !form.state.isSubmitting

    // Notify parent of validation state changes
    useEffect(() => {
      onValidationChange?.(isFormReady)
    }, [isFormReady, onValidationChange])

    const handleSubmit = () => {
      form.handleSubmit()
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="What best describes your gender?"
        description="Select one"
        canProgress={isFormReady}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="gender"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingForm>
    )
  }
)

GenderForm.displayName = 'GenderForm'