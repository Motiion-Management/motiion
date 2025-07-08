import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'
import { useRouter } from 'expo-router'
import React from 'react'
import { View, Text } from 'react-native'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard'
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus'

export default function GenderScreen() {
  const router = useRouter()
  const updateUser = useMutation(api.users.updateMyUser)
  const { getStepTitle } = useOnboardingStatus()

  const handleContinue = async () => {
    try {
      // TODO: Implement gender form logic
      console.log('Gender step - implement form logic')
      
      // For now, just redirect to let the system determine next step
      router.replace('/(app)')
    } catch (error) {
      console.error('Error in gender step:', error)
    }
  }

  return (
    <OnboardingStepGuard requiredStep="gender">
      <BaseOnboardingScreen
        title={getStepTitle()}
        description="What's your gender?"
        canProgress={false} // TODO: Set to true when form is filled
        primaryAction={{
          onPress: handleContinue,
          disabled: true, // TODO: Enable when form is valid
        }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">
            Gender form will be implemented here
          </Text>
          <Text className="text-sm text-gray-400 mt-2">
            This will include gender selection options
          </Text>
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  )
}