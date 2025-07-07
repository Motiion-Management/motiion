import { useQuery } from 'convex/react'
import { Redirect } from 'expo-router'
import React from 'react'
import { View, ActivityIndicator } from 'react-native'

import { api } from '@packages/backend/convex/_generated/api'
import { ONBOARDING_STEPS } from '@packages/backend/convex/validators/users'

export default function AppRouter() {
  const user = useQuery(api.users.getMyUser)

  if (user === undefined) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (user === null) {
    return <Redirect href="/" />
  }

  if (user.onboardingStep === ONBOARDING_STEPS.COMPLETE) {
    return <Redirect href="/(app)/home" />
  }

  return <Redirect href={`/(app)/onboarding/${user.onboardingStep}`} />
}