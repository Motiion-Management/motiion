import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'
import { useRouter } from 'expo-router'
import React from 'react'
import { View, Text } from 'react-native'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard'
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus'

export default function HeadshotsScreen() {
  const router = useRouter()
  const updateUser = useMutation(api.users.updateMyUser)
  const { getStepTitle } = useOnboardingStatus()

  const handleContinue = async () => {
    try {
      // TODO: Implement headshot upload logic
      console.log('Headshots step - implement upload logic')
      
      // For now, just redirect to let the system determine next step
      router.replace('/(app)')
    } catch (error) {
      console.error('Error in headshots step:', error)
    }
  }

  return (
    <OnboardingStepGuard requiredStep="headshots">
      <BaseOnboardingScreen
        title={getStepTitle()}
        description="Upload your professional headshots to showcase your look."
        canProgress={false} // TODO: Set to true when headshots are uploaded
        primaryAction={{
          onPress: handleContinue,
          disabled: true, // TODO: Enable when headshots are uploaded
        }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">
            Headshot upload component will be implemented here
          </Text>
          <Text className="text-sm text-gray-400 mt-2">
            This will include drag & drop, multiple image selection, and preview
          </Text>
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  )
}