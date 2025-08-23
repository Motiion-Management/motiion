import { api } from '@packages/backend/convex/_generated/api'
import { HAIRCOLOR } from '@packages/backend/convex/validators/attributes'
import { useMutation } from 'convex/react'
import React, { forwardRef, useEffect } from 'react'
import { toast } from 'sonner-native'
import * as z from 'zod'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import { useUser } from '~/hooks/useUser'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

const hairColorValidator = z.object({
  hairColor: z.enum(HAIRCOLOR, {
    required_error: 'Please select a hair color',
  }),
})

type HairColorSchema = z.infer<typeof hairColorValidator>

export interface HairColorFormData {
  hairColor: string
}

export const HairColorForm = forwardRef<OnboardingFormRef, OnboardingFormProps<HairColorFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const patchUserAttributes = useMutation(api.users.patchUserAttributes)
    const { user } = useUser()

    // Get existing value from user
    const existingHairColor = initialData?.hairColor || user?.attributes?.hairColor

    const form = useAppForm({
      defaultValues: {
        hairColor: existingHairColor,
      } as HairColorSchema,
      validators: {
        onChange: hairColorValidator,
      },
      onSubmit: async ({ value }) => {
        if (!value.hairColor) return

        try {
          await patchUserAttributes({
            attributes: { hairColor: value.hairColor },
          })

          await onComplete({
            hairColor: value.hairColor,
          })
        } catch (error) {
          console.error('Error updating hair color:', error)
          toast.error('Failed to update hair color. Please try again.')
          throw error
        }
      },
    })

    const radioOptions = HAIRCOLOR.map((color) => ({
      value: color,
      label: color,
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
        title="What color is your hair?"
        description="Select one"
        canProgress={isFormReady}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="hairColor"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingForm>
    )
  }
)

HairColorForm.displayName = 'HairColorForm'