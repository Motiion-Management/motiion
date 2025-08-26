import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import React, { forwardRef, useEffect } from 'react'
import { View, ScrollView, Pressable, Keyboard } from 'react-native'

import { WorkLocationPicker } from '~/components/ui/work-location-picker'
import { useWorkLocationForm } from '~/hooks/useWorkLocationForm'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

export interface WorkLocationFormData {
  workLocation: string[]
}

export const WorkLocationForm = forwardRef<OnboardingFormRef, OnboardingFormProps<WorkLocationFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const updateUser = useMutation(api.users.updateMyUser)
    const user = useQuery(api.users.getMyUser)

    // Get primary location from previous step
    const primaryLocation = user?.location
      ? {
          city: user.location.city || '',
          state: user.location.state || '',
          stateCode: user.location.state || '',
          country: user.location.country || 'United States',
        }
      : null

    // Convert existing work locations back to PlaceKitLocation format
    const existingWorkLocations =
      user?.workLocation?.map((locationString) => {
        const [city, state] = locationString.split(', ')
        return {
          city,
          state,
          stateCode: state,
          country: 'United States',
        }
      }) || []

    const workLocationForm = useWorkLocationForm({
      primaryLocation,
      existingWorkLocations,
      onSubmit: async (data) => {
        // Convert locations to array of strings for the backend
        const workLocations = data.locations
          .filter(Boolean)
          .map((location) => `${location!.city}, ${location!.state}`)

        await updateUser({
          workLocation: workLocations,
        })

        await onComplete({ workLocation: workLocations })
      },
    })

    // Notify parent of validation state changes
    useEffect(() => {
      onValidationChange?.(workLocationForm.isValid && !workLocationForm.isSubmitting)
    }, [workLocationForm.isValid, workLocationForm.isSubmitting, onValidationChange])

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Where can you work as a local?"
        description=""
        canProgress={workLocationForm.isValid}
        mode={mode}
        onCancel={onCancel}
        onSubmit={workLocationForm.actions.submit}
        secondaryAction={
          workLocationForm.canAddMore
            ? {
                text: 'Add a location',
                onPress: workLocationForm.actions.addLocation,
              }
            : undefined
        }>
        
        <Pressable className="w-full flex-1" onPress={Keyboard.dismiss}>
          <ScrollView
            className="w-full flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 300 }}
            style={{ overflow: 'visible' }}>
            <View className="gap-6" style={{ overflow: 'visible' }}>
              {/* Location inputs */}
              {workLocationForm.data.locations.map((location, index) => (
                <WorkLocationPicker
                  key={index}
                  index={index}
                  value={location}
                  onValueChange={(newLocation) =>
                    workLocationForm.actions.setLocation(index, newLocation)
                  }
                  onRemove={() => workLocationForm.actions.removeLocation(index)}
                  excludeLocations={workLocationForm.selectedLocations.filter((_, i) => i !== index)}
                  error={workLocationForm.errors.locations?.[index]}
                />
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </BaseOnboardingForm>
    )
  }
)

WorkLocationForm.displayName = 'WorkLocationForm'