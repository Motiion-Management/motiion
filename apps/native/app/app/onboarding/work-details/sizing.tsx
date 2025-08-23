import React from 'react'

import { SizingForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function SizingScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <SizingForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}
