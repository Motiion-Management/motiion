import React, { useMemo } from 'react'
import { View, ScrollView } from 'react-native'
import { Controller, useForm } from 'react-hook-form'

import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { debounce } from '~/lib/debounce'
import { TEAM_FIELDS } from '~/config/experienceTypes'
import { Experience } from '~/types/experiences'

interface ExperienceTeamFormProps {
  initialData?: Partial<Experience>
  onChange: (data: Partial<Experience>) => void
}

export function ExperienceTeamForm({ 
  initialData = {},
  onChange 
}: ExperienceTeamFormProps) {
  const { control, getValues } = useForm({
    defaultValues: {
      mainTalent: initialData.mainTalent || [],
      choreographers: initialData.choreographers || [],
      associateChoreographers: initialData.associateChoreographers || []
    }
  })

  // Debounced notification to parent
  const notifyChange = useMemo(
    () => debounce(() => {
      const values = getValues()
      onChange(values)
    }, 300),
    [getValues, onChange]
  )

  const renderField = (field: typeof TEAM_FIELDS[0]) => {
    return (
      <Controller
        key={field.name}
        control={control}
        name={field.name as any}
        render={({ field: { onChange, value } }) => (
          <View>
            <Input
              label={field.label}
              placeholder={field.placeholder}
              value={Array.isArray(value) ? value.join(', ') : ''}
              onChangeText={(text) => {
                const items = text.split(',').map(s => s.trim()).filter(Boolean)
                onChange(items)
                notifyChange()
              }}
            />
            <Text variant="footnote" className="mt-1 text-text-low">
              {field.name === 'mainTalent' 
                ? 'The main talent that you would like to credit working with.'
                : 'Separate multiple names with commas'}
            </Text>
          </View>
        )}
      />
    )
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="gap-4 pb-4">
        <Text variant="body" className="text-text-low">
          Add team members you worked with on this project. This helps build your professional network.
        </Text>
        
        {TEAM_FIELDS.map(field => renderField(field))}
        
        <View className="mt-4 rounded-lg bg-surface-high p-3">
          <Text variant="footnote" className="text-text-low">
            Team members added here will be displayed on your profile and can help others discover your work through connections.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}