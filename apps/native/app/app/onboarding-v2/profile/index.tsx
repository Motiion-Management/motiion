import { router } from 'expo-router'
import React from 'react'

import { ProfileTypeForm } from '~/components/forms/onboarding'
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard'

export default function ProfileTypeScreen() {
  const handleComplete = async () => {
    // Navigate to next step in profile group
    router.push('/app/onboarding-v2/profile/resume')
  }

  return (
    <OnboardingStepGuard requiredStep="profile-type">
      <ProfileTypeForm
        mode="fullscreen"
        onComplete={handleComplete}
      />
    </OnboardingStepGuard>
  )
}