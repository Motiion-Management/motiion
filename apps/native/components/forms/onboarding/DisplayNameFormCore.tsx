import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import * as z from 'zod'
import { View } from 'react-native'
import { useStore } from '@tanstack/react-form'

import { useAppForm } from '~/components/form/appForm'
import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { BaseFormContainer } from '~/components/onboarding/BaseFormContainer'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

export const displayNameSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: 'Preferred name is required' })
    .min(2, { message: 'Preferred name must be at least 2 characters' })
    .max(50, { message: 'Preferred name must be less than 50 characters' }),
})

export type DisplayNameValues = z.infer<typeof displayNameSchema>

export const DisplayNameFormCore = forwardRef<FormHandle, FormProps<DisplayNameValues>>(function DisplayNameFormCore(
  { mode, initialValues, onSubmit, onDirtyChange },
  ref
) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onChange: displayNameSchema },
    onSubmit: async ({ value }) => {
      await onSubmit({ displayName: value.displayName.trim() })
    },
  })

  const canSubmit = useStore(form.store, (s: any) => s.canSubmit && !s.isSubmitting)
  const isDirty = useStore(form.store, (s: any) => s.isDirty)

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
    isDirty: () => !!isDirty,
    isValid: () => !!canSubmit,
  }))

  useEffect(() => {
    onDirtyChange?.(!!isDirty)
  }, [isDirty, onDirtyChange])

  return (
    <BaseFormContainer
      title={mode === 'fullscreen' ? 'What name do you want displayed?' : undefined}
      description={undefined}
      footer={null}
      gradientBackground={mode === 'fullscreen'}
    >
      <ValidationModeForm form={form}>
        <View className="gap-6">
          <form.AppField
            name="displayName"
            children={(field: any) => (
              <field.InputField
                label="PREFERRED NAME"
                placeholder="Enter your preferred name"
                helperTextProps={{
                  message:
                    'This will be the name displayed on your public profile. If you go by another name professionally, you should enter it here.',
                }}
                autoCapitalize="words"
                autoComplete="name"
                autoFocus
              />
            )}
          />
        </View>
      </ValidationModeForm>
    </BaseFormContainer>
  )
})

