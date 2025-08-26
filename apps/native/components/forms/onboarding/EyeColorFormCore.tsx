import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import * as z from 'zod'
import { useStore } from '@tanstack/react-form'

import { EYECOLOR } from '@packages/backend/convex/validators/attributes'
import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

export const eyeColorSchema = z.object({
  eyeColor: z.enum(EYECOLOR, { required_error: 'Please select an eye color' }),
})

export type EyeColorValues = z.infer<typeof eyeColorSchema>

export const EyeColorFormCore = forwardRef<FormHandle, FormProps<EyeColorValues>>(function EyeColorFormCore(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onChange: eyeColorSchema },
    onSubmit: async ({ value }) => onSubmit(value),
  })

  const isValid = useStore(form.store, (s: any) => s.canSubmit && !s.isSubmitting)

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
    isDirty: () => !!useStore(form.store, (s: any) => s.isDirty),
    isValid: () => !!isValid,
  }))

  useEffect(() => {
    onValidChange?.(!!isValid)
  }, [isValid, onValidChange])

  const options = EYECOLOR.map((c) => ({ value: c, label: c }))

  return (
    <ValidationModeForm form={form}>
      <form.AppField name="eyeColor" children={(field: any) => <field.RadioGroupField options={options} />} />
    </ValidationModeForm>
  )
})

