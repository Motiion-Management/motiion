import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import React, { forwardRef, useEffect } from 'react'
import { View } from 'react-native'

import { LocationPicker } from '~/components/ui/location-picker-placekit'
import { useLocationForm } from '~/hooks/useLocationForm'

import { BaseOnboardingForm } from './BaseOnboardingForm'
import { OnboardingFormProps, OnboardingFormRef } from './types'

export interface LocationFormData {
  location: any
}

export const LocationForm = forwardRef<OnboardingFormRef, OnboardingFormProps<LocationFormData>>(
  ({ initialData, onComplete, onCancel, mode = 'fullscreen', onValidationChange }, ref) => {
    const updateUser = useMutation(api.users.updateMyUser)
    const user = useQuery(api.users.getMyUser)

    // Initialize form with user's current location if available
    const initialLocation = user?.location
      ? {
          city: user.location.city || '',
          state: user.location.state || '',
          stateCode: user.location.state || '', // Use state as fallback since stateCode doesn't exist in schema
          country: user.location.country || 'United States',
        }
      : null

    const locationForm = useLocationForm({
      initialValue: initialLocation,
      onSubmit: async (data) => {
        if (!data.primaryLocation) return

        // Update user location in database
        await updateUser({
          location: {
            city: data.primaryLocation.city,
            state: data.primaryLocation.state,
            country: 'United States',
          },
        })

        await onComplete({ location: data.primaryLocation })
      },
    })

    // Notify parent of validation state changes
    useEffect(() => {
      onValidationChange?.(locationForm.isValid && !locationForm.isSubmitting)
    }, [locationForm.isValid, locationForm.isSubmitting, onValidationChange])

    return (
      <BaseOnboardingForm
        ref={ref}
        title="Where are you located?"
        description=""
        canProgress={locationForm.isValid}
        mode={mode}
        onCancel={onCancel}
        onSubmit={locationForm.actions.submit}>
        
        <View className="w-full">
          <LocationPicker
            value={locationForm.data.primaryLocation}
            onValueChange={locationForm.actions.setLocation}
            error={locationForm.errors.primaryLocation}
          />
        </View>
      </BaseOnboardingForm>
    )
  }
)

LocationForm.displayName = 'LocationForm'