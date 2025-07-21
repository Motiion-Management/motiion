import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import React from 'react'
import { View } from 'react-native'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { LocationPicker } from '~/components/ui/location-picker'
import { useLocationForm } from '~/hooks/useLocationForm'
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor'

export default function LocationScreen() {
  const updateUser = useMutation(api.users.updateMyUser)
  const user = useQuery(api.users.getMyUser)
  const cursor = useOnboardingCursor()

  // Initialize form with user's current location if available
  const initialLocation = user?.location ? {
    city: user.location.city || '',
    state: user.location.state || '',
    stateCode: user.location.state || '' // Use state as fallback since stateCode doesn't exist in schema
  } : null

  const locationForm = useLocationForm({
    initialValue: initialLocation,
    onSubmit: async (data) => {
      if (!data.primaryLocation) return
      
      // Update user location in database
      await updateUser({
        location: {
          city: data.primaryLocation.city,
          state: data.primaryLocation.state,
          country: 'United States'
        }
      })
      
      // Navigate to next step
      cursor.goToNextStep()
    }
  })

  return (
    <BaseOnboardingScreen
      title="Where are you located?"
      canProgress={locationForm.isValid}
      primaryAction={{
        onPress: locationForm.actions.submit,
        disabled: !locationForm.isValid || locationForm.isSubmitting,
      }}>
      <View className="w-full">
        <LocationPicker
          value={locationForm.data.primaryLocation}
          onValueChange={locationForm.actions.setLocation}
          error={locationForm.errors.primaryLocation}
        />
      </View>
    </BaseOnboardingScreen>
  )
}
