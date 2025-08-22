import { api } from '@packages/backend/convex/_generated/api'
import { EYECOLOR } from '@packages/backend/convex/validators/attributes'
import { useMutation } from 'convex/react'
import React, { forwardRef } from 'react'
import { toast } from 'sonner-native'
import * as z from 'zod'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import { useUser } from '~/hooks/useUser'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

const eyeColorValidator = z.object({
  eyeColor: z.enum(EYECOLOR, {
    required_error: 'Please select an eye color',
  }),
})

type EyeColorSchema = z.infer<typeof eyeColorValidator>

export interface EyeColorFormData {
  eyeColor: string
}

export const EyeColorForm = forwardRef<OnboardingFormRef, OnboardingFormProps<EyeColorFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen' }, ref) => {
    const patchUserAttributes = useMutation(api.users.patchUserAttributes)
    const { user } = useUser()

    // Get existing value from user
    const existingEyeColor = initialData?.eyeColor || user?.attributes?.eyeColor

    const form = useAppForm({
      defaultValues: {
        eyeColor: existingEyeColor,
      } as EyeColorSchema,
      validators: {
        onChange: eyeColorValidator,
      },
      onSubmit: async ({ value }) => {
        if (!value.eyeColor) return

        try {
          await patchUserAttributes({
            attributes: { eyeColor: value.eyeColor },
          })

          await onComplete({
            eyeColor: value.eyeColor,
          })
        } catch (error) {
          console.error('Error updating eye color:', error)
          toast.error('Failed to update eye color. Please try again.')
          throw error
        }
      },
    })

    const radioOptions = EYECOLOR.map((color) => ({
      value: color,
      label: color,
    }))

    const isFormReady = form.state.canSubmit && !form.state.isSubmitting

    const handleSubmit = () => {
      form.handleSubmit()
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="What color are your eyes?"
        description="Select one"
        canProgress={isFormReady}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="eyeColor"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingForm>
    )
  }
)

EyeColorForm.displayName = 'EyeColorForm'