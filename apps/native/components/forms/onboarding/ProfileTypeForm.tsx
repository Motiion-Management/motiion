import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import React, { forwardRef } from 'react'
import * as z from 'zod'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

const profileTypeValidator = z.object({
  profileType: z.enum(['dancer', 'choreographer'], {
    required_error: 'Please select a profile type',
  }),
})

type ProfileTypeSchema = z.infer<typeof profileTypeValidator>

export interface ProfileTypeFormData {
  profileType: 'dancer' | 'choreographer'
}

export const ProfileTypeForm = forwardRef<OnboardingFormRef, OnboardingFormProps<ProfileTypeFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const user = useQuery(api.users.getMyUser)
    const updateUser = useMutation(api.users.updateMyUser)

    const form = useAppForm({
      defaultValues: {
        profileType: initialData?.profileType || user?.profileType,
      } as ProfileTypeSchema,
      validators: {
        onChange: profileTypeValidator,
      },
      onSubmit: async ({ value }) => {
        if (!value.profileType) return

        try {
          // Update the profile type
          await updateUser({
            profileType: value.profileType,
          })

          await onComplete({
            profileType: value.profileType,
          })
        } catch (error) {
          console.error('Error updating profile type:', error)
          throw error
        }
      },
    })

    const radioOptions = [
      { value: 'dancer', label: 'Dancer' },
      { value: 'choreographer', label: 'Choreographer' },
    ]

    const isFormReady = form.state.canSubmit && !form.state.isSubmitting

    const handleSubmit = () => {
      form.handleSubmit()
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="What type of profile are you creating?"
        description="Select the option that best describes you"
        canProgress={isFormReady}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="profileType"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingForm>
    )
  }
)

ProfileTypeForm.displayName = 'ProfileTypeForm'