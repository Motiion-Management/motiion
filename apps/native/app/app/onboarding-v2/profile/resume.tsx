import { router } from 'expo-router'
import React from 'react'

import { ResumeForm } from '~/components/forms/onboarding'
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard'

export default function ResumeScreen() {
  const handleComplete = async () => {
    // Navigate to next group (attributes)
    router.push('/app/onboarding-v2/attributes')
  }

  return (
    <OnboardingStepGuard requiredStep="resume">
      <ResumeForm
        mode="fullscreen"
        onComplete={handleComplete}
      />
    </OnboardingStepGuard>
  )
}