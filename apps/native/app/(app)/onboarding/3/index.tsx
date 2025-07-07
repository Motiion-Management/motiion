import { useMutation } from 'convex/react'
import { useRouter } from 'expo-router'
import React from 'react'
import { View, ScrollView } from 'react-native'

import { api } from '@packages/backend/convex/_generated/api'
import { ONBOARDING_STEPS } from '@packages/backend/convex/validators/users'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'

export default function OnboardingHeadshotsScreen() {
  const router = useRouter()
  const updateUser = useMutation(api.users.updateMyUser)

  const handleContinue = async () => {
    await updateUser({
      onboardingStep: ONBOARDING_STEPS.RESUME
    })
    router.push('/(app)/onboarding/4')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <ScrollView className="flex-1 px-6">
      <View className="py-8">
        <Text variant="largeTitle" className="mb-4">
          Add Your Headshots
        </Text>
        <Text variant="body" className="mb-8 text-text-secondary">
          Upload professional photos that showcase your talent.
        </Text>

        <View className="mb-8">
          <Text variant="body" className="text-text-secondary">
            This is the Headshots step. Photo upload functionality will be added.
          </Text>
        </View>

        <View className="gap-3">
          <Button onPress={handleContinue} size="lg">
            <Text>Continue</Text>
          </Button>
          <Button onPress={handleBack} variant="secondary" size="lg">
            <Text>Back</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}