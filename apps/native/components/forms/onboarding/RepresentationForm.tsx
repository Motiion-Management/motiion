import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import * as z from 'zod'
import { useStore } from '@tanstack/react-form'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

export const representationSchema = z.object({
  representationStatus: z.enum(['represented', 'seeking', 'independent'], {
    required_error: 'Please select your representation status',
  }),
})

export type RepresentationValues = z.infer<typeof representationSchema>

const options = [
  { value: 'represented', label: "Yes, I'm represented" },
  { value: 'seeking', label: 'No, but looking for representation' },
  { value: 'independent', label: "No, I'm an independent artist" },
]

export const RepresentationForm = forwardRef<FormHandle, FormProps<RepresentationValues>>(function RepresentationForm(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onChange: representationSchema },
    onSubmit: async ({ value }) => onSubmit(value),
  })

  const isValid = useStore(form.store, (s) => s.canSubmit && !s.isSubmitting)

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
    isDirty: () => !!useStore(form.store, (s) => s.isDirty),
    isValid: () => !!isValid,
  }))

  useEffect(() => {
    onValidChange?.(!!isValid)
  }, [isValid, onValidChange])

  return (
    <ValidationModeForm form={form}>
      <form.AppField name="representationStatus" children={(field: any) => <field.RadioGroupField options={options} />} />
    </ValidationModeForm>
  )
})

