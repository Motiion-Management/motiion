import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import * as z from 'zod'
import { useStore } from '@tanstack/react-form'
import { useConvex } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { representationFormSchema } from '@packages/backend/convex/schemas/fields/representation'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

// Backward compatibility export
export const agentSchema = representationFormSchema
export type AgentValues = z.infer<typeof representationFormSchema>

export const AgentForm = forwardRef<FormHandle, FormProps<AgentValues>>(function AgentForm(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const convex = useConvex()

  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onChange: agentSchema },
    onSubmit: async ({ value }) => onSubmit(value),
  })

  const isValid = useStore(form.store, (s) => s.canSubmit && !s.isSubmitting)
  const isDirty = useStore(form.store, (s) => s.isDirty)

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
    isDirty: () => !!isDirty,
    isValid: () => !!isValid,
  }))

  useEffect(() => {
    onValidChange?.(!!isValid)
  }, [isValid, onValidChange])

  // Auto-save when form is dirty and valid
  useEffect(() => {
    if (isDirty && isValid) {
      form.handleSubmit()
    }
  }, [isDirty, isValid, form])

  return (
    <ValidationModeForm form={form}>
      <form.AppField
        name="representation.agencyId"
        children={(field: any) => (
          <field.BottomSheetComboboxField
            label="AGENCY"
            placeholder="Search for your agency..."
            data={[]}
            onSearchAsync={async (term: string) => {
              if (!term) return [] as any
              const results = await convex.query(api.agencies.search, { query: term })
              return results.map((a: any) => ({
                value: a._id,
                label: a.location ? `${a.name} — ${a.location.city}, ${a.location.state}` : a.name,
              }))
            }}
            getLabelAsync={async (id: string) => {
              if (!id) return null as any
              const agency = await convex.query(api.agencies.getAgency, { id: id as any })
              if (!agency) return null as any
              return agency.location
                ? `${agency.name} — ${agency.location.city}, ${agency.location.state}`
                : agency.name
            }}
          />
        )}
      />
    </ValidationModeForm>
  )
})
