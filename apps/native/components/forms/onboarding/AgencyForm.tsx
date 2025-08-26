import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import * as z from 'zod'
import { useStore } from '@tanstack/react-form'
import { useConvex } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

export const agencySchema = z.object({ agencyId: z.string().min(1, 'Please select an agency') })
export type AgencyValues = z.infer<typeof agencySchema>

export const AgencyForm = forwardRef<FormHandle, FormProps<AgencyValues>>(function AgencyForm(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const convex = useConvex()

  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onChange: agencySchema },
    onSubmit: async ({ value }) => onSubmit(value),
  })

  const canProgress = useStore(form.store, (s) => !!s.values.agencyId && s.canSubmit)

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
    isDirty: () => !!useStore(form.store, (s) => s.isDirty),
    isValid: () => !!canProgress,
  }))

  useEffect(() => {
    onValidChange?.(!!canProgress && !form.state.isSubmitting)
  }, [canProgress, form.state.isSubmitting, onValidChange])

  return (
    <ValidationModeForm form={form}>
      <form.AppField
        name="agencyId"
        children={(field: any) => (
          <field.BottomSheetComboboxField
            label="Agency"
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

