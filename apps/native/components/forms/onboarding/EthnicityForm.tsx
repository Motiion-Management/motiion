import { api } from '@packages/backend/convex/_generated/api'
import { ETHNICITY } from '@packages/backend/convex/validators/attributes'
import { useStore } from '@tanstack/react-form'
import { useMutation } from 'convex/react'
import React, { forwardRef, useEffect } from 'react'
import { toast } from 'sonner-native'
import * as z from 'zod'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import { useUser } from '~/hooks/useUser'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

const ethnicityValidator = z.object({
  ethnicity: z.array(z.enum(ETHNICITY)).min(1, 'Please select at least one ethnicity'),
})

type EthnicitySchema = z.infer<typeof ethnicityValidator>

export interface EthnicityFormData {
  ethnicity: string[]
}

export const EthnicityForm = forwardRef<OnboardingFormRef, OnboardingFormProps<EthnicityFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const { user } = useUser()
    const patchUserAttributes = useMutation(api.users.patchUserAttributes)

    const form = useAppForm({
      defaultValues: {
        ethnicity: initialData?.ethnicity || user?.attributes?.ethnicity || [],
      } as EthnicitySchema,
      validators: {
        onChange: ethnicityValidator,
      },
      onSubmit: async ({ value }) => {
        if (!value.ethnicity?.length) return

        try {
          // Update user ethnicity in attributes
          await patchUserAttributes({
            attributes: { ethnicity: value.ethnicity },
          })

          await onComplete({
            ethnicity: value.ethnicity,
          })
        } catch (error) {
          console.error('Error updating ethnicity:', error)
          toast.error('Failed to update ethnicity. Please try again.')
          throw error
        }
      },
    })

    const ethnicityOptions = ETHNICITY.map((ethnicity) => ({
      value: ethnicity,
      label: ethnicity,
    }))

    const isFormReady =
      useStore(form.store, (state) => state.canSubmit && state.isDirty) ||
      !!(user?.attributes?.ethnicity?.length && user.attributes.ethnicity.length > 0)

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
        title="What's your ethnicity?"
        description="Select all that apply"
        canProgress={isFormReady}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="ethnicity"
            children={(field) => <field.CheckboxGroupField options={ethnicityOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingForm>
    )
  }
)

EthnicityForm.displayName = 'EthnicityForm'