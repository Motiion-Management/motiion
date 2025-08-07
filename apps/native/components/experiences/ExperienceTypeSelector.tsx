import React from 'react'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Select } from '~/components/ui/select'

export interface ExperienceType {
  value: string
  label: string
  description?: string
}

const EXPERIENCE_TYPES: ExperienceType[] = [
  { value: 'tv-film', label: 'Television & Film', description: 'TV shows, films, and streaming content' },
  { value: 'music-video', label: 'Music Videos', description: 'Music videos and visual albums' },
  { value: 'live-performance', label: 'Live Performances', description: 'Tours, festivals, concerts, and shows' },
  { value: 'commercial', label: 'Commercials', description: 'Brand campaigns and advertisements' },
]

interface ExperienceTypeSelectorProps {
  value?: string
  onChange: (type: string) => void
  readOnly?: boolean
  disabled?: boolean
}

/**
 * Component for selecting experience type
 * Can be made read-only when editing existing experiences
 */
export function ExperienceTypeSelector({
  value,
  onChange,
  readOnly = false,
  disabled = false,
}: ExperienceTypeSelectorProps) {
  const selectedType = EXPERIENCE_TYPES.find(t => t.value === value)
  
  if (readOnly && selectedType) {
    // Render as read-only text when editing
    return (
      <View className="gap-2">
        <Text variant="label" className="text-text-secondary">
          PROJECT TYPE
        </Text>
        <View className="rounded-xl bg-surface-high px-4 py-3 opacity-60">
          <Text className="text-text-default">{selectedType.label}</Text>
          {selectedType.description && (
            <Text variant="footnote" className="mt-1 text-text-secondary">
              {selectedType.description}
            </Text>
          )}
        </View>
      </View>
    )
  }
  
  return (
    <View className="gap-2">
      <Text variant="label" className="text-text-secondary">
        PROJECT TYPE
      </Text>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || readOnly}
        placeholder="Select experience type"
      >
        {EXPERIENCE_TYPES.map(type => (
          <Select.Item key={type.value} value={type.value}>
            <View>
              <Text>{type.label}</Text>
              {type.description && (
                <Text variant="footnote" className="text-text-secondary">
                  {type.description}
                </Text>
              )}
            </View>
          </Select.Item>
        ))}
      </Select>
    </View>
  )
}