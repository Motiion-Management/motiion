import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'
import React, { forwardRef, useEffect } from 'react'
import { View } from 'react-native'
import * as z from 'zod'

import { ValidationModeForm } from '~/components/form/ValidationModeForm'
import { useAppForm } from '~/components/form/appForm'
import { useStore } from '@tanstack/react-form'
import { useUser } from '~/hooks/useUser'
import { useConvex } from 'convex/react'
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { OnboardingFormProps, OnboardingFormRef } from './types'

export interface AgencyFormData {
  agencyId: string
}

const agencyValidator = z.object({
  agencyId: z.string().min(1, 'Please select an agency'),
})

interface AgencyResult {
  _id: string
  name: string
  shortName?: string
  location?: {
    city: string
    state: string
  }
}

export const AgencyForm = forwardRef<OnboardingFormRef, OnboardingFormProps<AgencyFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const addMyRepresentation = useMutation(api.users.representation.addMyRepresentation)
    const nav = useSimpleOnboardingFlow()

    const { user } = useUser()
    const convex = useConvex()

    const form = useAppForm({
      defaultValues: {
        agencyId: initialData?.agencyId || user?.representation?.agencyId || '',
      },
      validators: {
        onChange: agencyValidator,
      },
      onSubmit: async ({ value }) => {
        try {
          if (value.agencyId) {
            await addMyRepresentation({ agencyId: value.agencyId as any })
          }
          await onComplete({ agencyId: value.agencyId })
        } catch (error) {
          console.error('Error saving agency:', error)
        }
      },
    })

    const canProgress = useStore(form.store, (s) => !!s.values.agencyId && s.canSubmit)

    // Notify parent of validation state changes
    useEffect(() => {
      onValidationChange?.(canProgress && !form.state.isSubmitting)
    }, [canProgress, form.state.isSubmitting, onValidationChange])

    return (
      <BaseOnboardingScreen
        title="Select Agency"
        description="Search and select your representation agency"
        canProgress={canProgress}
        primaryAction={{
          onPress: () => form.handleSubmit(),
          handlesNavigation: true,
        }}>
        <ValidationModeForm form={form}>
          <View className="gap-4">
            <form.AppField
              name="agencyId"
              children={(field) => (
                <field.BottomSheetComboboxField
                  label="Agency"
                  placeholder="Search for your agency..."
                  data={[]}
                  onSearchAsync={async (term: string) => {
                    if (!term) return [] as any
                    const results = await convex.query(api.agencies.search, { query: term })
                    return results.map((a: AgencyResult) => ({
                      value: a._id,
                      label: a.location
                        ? `${a.name} — ${a.location.city}, ${a.location.state}`
                        : a.name,
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
            {/* Optional: message when a user wants to add a new agency can go here */}
          </View>
        </ValidationModeForm>
      </BaseOnboardingScreen>
    )
  }
)

AgencyForm.displayName = 'AgencyForm'