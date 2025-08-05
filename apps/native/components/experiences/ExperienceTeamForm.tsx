import React, { useMemo, useEffect } from 'react'
import { View } from 'react-native'
import { useStore } from '@tanstack/react-form'
import * as z from 'zod'

import { useAppForm } from '~/components/form/appForm'
import { fieldContext } from '~/components/form/context'
import { ChipsField } from '~/components/form/ChipsField'
import { Text } from '~/components/ui/text'
import { debounce } from '~/lib/debounce'
import { TEAM_FIELDS } from '~/config/experienceTypes'
import { Experience } from '~/types/experiences'

interface ExperienceTeamFormProps {
  initialData?: Partial<Experience>
  onChange: (data: Partial<Experience>) => void
}

// Declarative schema for team fields
const teamSchema = z.object({
  mainTalent: z.array(z.string()).optional().default([]),
  choreographers: z.array(z.string()).optional().default([]),
  associateChoreographers: z.array(z.string()).optional().default([]),
})

type TeamFormValues = z.infer<typeof teamSchema>

export function ExperienceTeamForm({ initialData = {}, onChange }: ExperienceTeamFormProps) {
  const form = useAppForm({
    defaultValues: {
      mainTalent: initialData.mainTalent || [],
      choreographers: initialData.choreographers || [],
      associateChoreographers: initialData.associateChoreographers || [],
    } satisfies TeamFormValues,
    validators: {
      onChange: teamSchema as any,
    },
    onSubmit: async ({ value }) => {
      onChange(value)
    },
  })

  // Watch for form changes and notify parent
  const notifyChange = useMemo(
    () =>
      debounce(() => {
        onChange(form.state.values)
      }, 300),
    [onChange]
  )

  // Subscribe to form state changes
  const formValues = useStore(form.store, (state) => state.values)

  useEffect(() => {
    notifyChange()
  }, [formValues, notifyChange])

  const renderField = (field: (typeof TEAM_FIELDS)[0]) => {
    const helpText =
      field.name === 'mainTalent'
        ? 'The main talent that you would like to credit working with.'
        : 'Separate multiple names with commas'

    return (
      <form.Field
        key={field.name}
        name={field.name as keyof TeamFormValues}
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <ChipsField label={field.label} placeholder={field.placeholder} helpText={helpText} />
          </fieldContext.Provider>
        )}
      />
    )
  }

  return (
    <View className="gap-4">
        <Text variant="body" className="text-text-low">
          Add team members you worked with on this project. This helps build your professional
          network.
        </Text>

        {TEAM_FIELDS.map((field) => renderField(field))}

        <View className="mt-4 rounded-lg bg-surface-high p-3">
          <Text variant="footnote" className="text-text-low">
            Team members added here will be displayed on your profile and can help others discover
            your work through connections.
          </Text>
        </View>
    </View>
  )
}