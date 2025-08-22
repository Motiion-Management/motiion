import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'
import React, { forwardRef } from 'react'
import { View } from 'react-native'
import * as z from 'zod'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import { useStore } from '@tanstack/react-form'
import { useUser } from '~/hooks/useUser'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

const displayNameValidator = z.object({
  displayName: z
    .string()
    .min(1, { message: 'Preferred name is required' })
    .min(2, { message: 'Preferred name must be at least 2 characters' })
    .max(50, { message: 'Preferred name must be less than 50 characters' }),
})

type DisplayNameSchema = z.infer<typeof displayNameValidator>

export interface DisplayNameFormData {
  displayName: string
}

export const DisplayNameForm = forwardRef<OnboardingFormRef, OnboardingFormProps<DisplayNameFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', autoFocus = true }, ref) => {
    const updateMyUser = useMutation(api.users.updateMyUser)
    const { user } = useUser()

    const form = useAppForm({
      defaultValues: {
        displayName: initialData?.displayName || user?.displayName || user?.fullName || '',
      } as DisplayNameSchema,
      validators: {
        onChange: displayNameValidator,
      },
      onSubmit: async ({ value }) => {
        try {
          await updateMyUser({
            displayName: value.displayName.trim(),
          })

          await onComplete({
            displayName: value.displayName.trim(),
          })
        } catch (error) {
          console.error('Error saving display name:', error)
          throw error
        }
      },
    })

    const canProgress = useStore(form.store, (s) => s.canSubmit)

    const handleSubmit = () => {
      form.handleSubmit()
    }

    return (
      <BaseOnboardingForm
        ref={ref}
        title="What name do you want displayed?"
        canProgress={canProgress}
        mode={mode}
        onCancel={onCancel}
        onSubmit={handleSubmit}>
        <ValidationModeForm form={form}>
          <View className="gap-6">
            <form.AppField
              name="displayName"
              children={(field) => (
                <field.InputField
                  label="PREFERRED NAME"
                  placeholder="Enter your preferred name"
                  helperTextProps={{
                    message:
                      'This will be the name displayed on your public profile. If you go by another name professionally, you should enter it here.',
                  }}
                  autoCapitalize="words"
                  autoComplete="name"
                  autoFocus={autoFocus}
                />
              )}
            />
          </View>
        </ValidationModeForm>
      </BaseOnboardingForm>
    )
  }
)

DisplayNameForm.displayName = 'DisplayNameForm'