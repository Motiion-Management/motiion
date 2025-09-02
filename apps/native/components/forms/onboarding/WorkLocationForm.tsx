import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import { View, ScrollView, Pressable, Keyboard } from 'react-native'

import { WorkLocationPicker } from '~/components/ui/work-location-picker'
import { useWorkLocationForm } from '~/hooks/useWorkLocationForm'
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts'

export interface PlaceKitLocation {
  city: string
  state: string
  stateCode?: string
  country: string
}

export interface WorkLocationValues {
  locations: (PlaceKitLocation | null)[]
}

export const WorkLocationForm = forwardRef<FormHandle, FormProps<WorkLocationValues>>(function WorkLocationForm(
  { initialValues, onSubmit, onValidChange },
  ref
) {
  const form = useWorkLocationForm({
    primaryLocation: initialValues.locations[0] || null,
    existingWorkLocations: (initialValues.locations.filter(Boolean) as PlaceKitLocation[]).slice(1),
    onSubmit: async (data) => {
      await onSubmit({ locations: data.locations })
    },
  })

  useImperativeHandle(ref, () => ({
    submit: () => form.actions.submit(),
    isDirty: () => false,
    isValid: () => form.isValid && !form.isSubmitting,
  }))

  useEffect(() => {
    onValidChange?.(form.isValid && !form.isSubmitting)
  }, [form.isValid, form.isSubmitting, onValidChange])

  return (
    <Pressable className="w-full flex-1" onPress={Keyboard.dismiss}>
      <ScrollView
        className="w-full flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 300 }}
        style={{ overflow: 'visible' }}>
        <View className="gap-6" style={{ overflow: 'visible' }}>
          {form.data.locations.map((location, index) => (
            <WorkLocationPicker
              key={index}
              index={index}
              value={location}
              onValueChange={(newLocation) => form.actions.setLocation(index, newLocation)}
              onRemove={() => form.actions.removeLocation(index)}
              excludeLocations={form.selectedLocations.filter((_, i) => i !== index)}
              error={form.errors.locations?.[index]}
            />
          ))}
        </View>
      </ScrollView>
    </Pressable>
  )
})

