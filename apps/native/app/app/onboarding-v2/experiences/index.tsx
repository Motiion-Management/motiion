import { router } from 'expo-router'
import React from 'react'

import { ExperiencesForm } from '~/components/forms/onboarding'
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard'

export default function ExperiencesScreen() {
  const handleComplete = async () => {
    // Navigate to review group
    router.push('/app/onboarding-v2/review')
  }

  return (
    <OnboardingStepGuard requiredStep="experiences">
      <ExperiencesForm
        mode="fullscreen"
        onComplete={handleComplete}
      />
    </OnboardingStepGuard>
  )
}