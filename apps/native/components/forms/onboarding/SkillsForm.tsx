import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import * as z from 'zod'
import { useStore } from '@tanstack/react-form'
import { zResume } from '@packages/backend/convex/validators/users'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

export const skillsSchema = zResume.pick({ skills: true, genres: true })
export type SkillsValues = z.infer<typeof skillsSchema>

export const SkillsForm = forwardRef<FormHandle, FormProps<SkillsValues>>(function SkillsForm(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onChange: skillsSchema },
    onSubmit: async ({ value }) => onSubmit(value),
  })

  const canProgress = useStore(form.store, (s) => (s.values.genres?.length ?? 0) > 0 && (s.values.skills?.length ?? 0) > 0 && s.canSubmit)

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
    isDirty: () => !!useStore(form.store, (s) => s.isDirty),
    isValid: () => !!canProgress && !form.state.isSubmitting,
  }))

  useEffect(() => {
    onValidChange?.(!!canProgress && !form.state.isSubmitting)
  }, [canProgress, form.state.isSubmitting, onValidChange])

  return (
    <ValidationModeForm form={form}>
      <form.AppField name="genres" children={(field: any) => <field.ChipsField label="GENRES" placeholder="Hip Hop, Musical Theater, Tap Dance..." autoCapitalize="words" />} />
      <form.AppField name="skills" children={(field: any) => <field.ChipsField label="SKILLS" placeholder="Breaking, Juggling, Skateboarding..." autoCapitalize="words" />} />
    </ValidationModeForm>
  )
})

