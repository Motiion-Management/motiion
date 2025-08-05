import React, { useMemo } from 'react'
import { View, ScrollView } from 'react-native'
import { Controller, useForm } from 'react-hook-form'

import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { Picker, PickerItem } from '~/components/ui/select'
import { debounce } from '~/lib/debounce'
import { 
  EXPERIENCE_FIELDS, 
  PROJECT_TYPES, 
  LIVE_EVENT_TYPES,
  DURATION_OPTIONS,
  COMMON_STUDIOS,
  COMMON_ROLES
} from '~/config/experienceTypes'
import { 
  ExperienceType, 
  LivePerformanceEventType,
  Experience 
} from '~/types/experiences'

interface ExperienceFormProps {
  experienceType: ExperienceType
  initialData?: Partial<Experience>
  onChange: (data: Partial<Experience>) => void
}

export function ExperienceForm({ 
  experienceType, 
  initialData = {},
  onChange 
}: ExperienceFormProps) {
  const { control, watch, setValue, getValues } = useForm({
    defaultValues: initialData as any
  })

  // Watch specific field for conditional rendering
  const eventType = experienceType === 'live-performance' 
    ? watch('eventType') as LivePerformanceEventType
    : undefined
  
  // Debounced notification to parent
  const notifyChange = useMemo(
    () => debounce(() => {
      const values = getValues()
      onChange(values)
    }, 300),
    [getValues, onChange]
  )

  // Filter fields based on experience type and event type
  const visibleFields = EXPERIENCE_FIELDS.filter(field => {
    if (!field.showForTypes?.includes(experienceType)) return false
    
    if (experienceType === 'live-performance' && field.showForEventTypes) {
      return eventType && field.showForEventTypes.includes(eventType)
    }
    
    return true
  })

  const renderField = (field: typeof EXPERIENCE_FIELDS[0]) => {
    switch (field.type) {
      case 'text':
        return (
          <Controller
            key={field.name}
            control={control}
            name={field.name as any}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={field.label}
                placeholder={field.placeholder}
                value={value || ''}
                onChangeText={(text) => {
                  onChange(text)
                  notifyChange()
                }}
                onBlur={onBlur}
              />
            )}
          />
        )

      case 'select':
        const options = field.options || []
        
        // Special handling for different select types
        if (field.name === 'projectType') {
          return (
            <View key={field.name}>
              <Text variant="labelSm" className="mb-2 text-text-low">
                {field.label}
              </Text>
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: { onChange, value } }) => (
                  <Picker
                    selectedValue={value}
                    onValueChange={(val) => {
                      onChange(val)
                      notifyChange()
                    }}>
                    <PickerItem label="Select..." value="" />
                    {PROJECT_TYPES.map(type => (
                      <PickerItem key={type.value} label={type.label} value={type.value} />
                    ))}
                  </Picker>
                )}
              />
            </View>
          )
        }

        if (field.name === 'eventType') {
          return (
            <View key={field.name}>
              <Text variant="labelSm" className="mb-2 text-text-low">
                {field.label}
              </Text>
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: { onChange, value } }) => (
                  <Picker
                    selectedValue={value}
                    onValueChange={(val) => {
                      onChange(val)
                      notifyChange()
                    }}>
                    <PickerItem label="Select..." value="" />
                    {LIVE_EVENT_TYPES.map(type => (
                      <PickerItem key={type.value} label={type.label} value={type.value} />
                    ))}
                  </Picker>
                )}
              />
            </View>
          )
        }

        if (field.name === 'duration') {
          return (
            <View key={field.name}>
              <Text variant="labelSm" className="mb-2 text-text-low">
                {field.label}
              </Text>
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: { onChange, value } }) => (
                  <Picker
                    selectedValue={value}
                    onValueChange={(val) => {
                      onChange(val)
                      notifyChange()
                    }}>
                    <PickerItem label="Select..." value="" />
                    {DURATION_OPTIONS.map(option => (
                      <PickerItem key={option.value} label={option.label} value={option.value} />
                    ))}
                  </Picker>
                )}
              />
            </View>
          )
        }

        if (field.name === 'studio') {
          return (
            <View key={field.name}>
              <Text variant="labelSm" className="mb-2 text-text-low">
                {field.label}
              </Text>
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: { onChange, value } }) => (
                  <Picker
                    selectedValue={value}
                    onValueChange={(val) => {
                      onChange(val)
                      notifyChange()
                    }}>
                    <PickerItem label="Select..." value="" />
                    {COMMON_STUDIOS.map(studio => (
                      <PickerItem key={studio} label={studio} value={studio} />
                    ))}
                  </Picker>
                )}
              />
            </View>
          )
        }

        return (
          <View key={field.name}>
            <Text variant="labelSm" className="mb-2 text-text-low">
              {field.label}
            </Text>
            <Controller
              control={control}
              name={field.name as any}
              render={({ field: { onChange, value } }) => (
                <Picker
                  selectedValue={value}
                  onValueChange={(val) => {
                    onChange(val)
                    notifyChange()
                  }}>
                  <PickerItem label="Select..." value="" />
                  {options.map(option => (
                    <PickerItem key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              )}
            />
          </View>
        )

      case 'date':
        return (
          <Controller
            key={field.name}
            control={control}
            name={field.name as any}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={field.label}
                placeholder="YYYY-MM-DD"
                value={value || ''}
                onChangeText={(text) => {
                  onChange(text)
                  notifyChange()
                }}
                onBlur={onBlur}
                keyboardType="numeric"
              />
            )}
          />
        )

      case 'chips':
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
                  Separate multiple items with commas
                </Text>
              </View>
            )}
          />
        )

      case 'multiselect':
        // For now, using a text input with comma separation
        // TODO: Implement proper multiselect component
        return (
          <Controller
            key={field.name}
            control={control}
            name={field.name as any}
            render={({ field: { onChange, value } }) => (
              <View>
                <Input
                  label={field.label}
                  placeholder={field.placeholder || 'Enter roles separated by commas'}
                  value={Array.isArray(value) ? value.join(', ') : ''}
                  onChangeText={(text) => {
                    const items = text.split(',').map(s => s.trim()).filter(Boolean)
                    onChange(items)
                    notifyChange()
                  }}
                />
                <Text variant="footnote" className="mt-1 text-text-low">
                  Common roles: {COMMON_ROLES.slice(0, 3).join(', ')}...
                </Text>
              </View>
            )}
          />
        )

      default:
        return null
    }
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="gap-4 pb-4">
        {visibleFields.map(field => renderField(field))}
      </View>
    </ScrollView>
  )
}