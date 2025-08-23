import React from 'react'

import { RepresentationForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function RepresentationScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <RepresentationForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}
