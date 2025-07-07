import { useMutation } from 'convex/react'
import { useRouter } from 'expo-router'
import React from 'react'
import { View, ScrollView } from 'react-native'

import { api } from '@packages/backend/convex/_generated/api'
import { ONBOARDING_STEPS } from '@packages/backend/convex/validators/users'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'

export default function OnboardingVisionScreen() {
  const router = useRouter()
  const updateUser = useMutation(api.users.updateMyUser)

  const handleContinue = async () => {
    await updateUser({
      onboardingStep: ONBOARDING_STEPS.PERSONAL_INFO
    })
    router.push('/(app)/onboarding/2')
  }

  return (
    <ScrollView className="flex-1 px-6">
      <View className="py-8">
        <Text variant="largeTitle" className="mb-4">
          Welcome to Motiion
        </Text>
        <Text variant="body" className="mb-8 text-text-secondary">
          Let's start by understanding your vision and goals as a talent.
        </Text>

        <View className="mb-8">
          <Text variant="title3" className="mb-4">
            What brings you here?
          </Text>
          <Text variant="body" className="text-text-secondary">
            This is the Vision/Goals step. Implementation details will be added based on your Figma design.
          </Text>
        </View>

        <Button onPress={handleContinue} size="lg">
          <Text>Continue</Text>
        </Button>
      </View>
    </ScrollView>
  )
}