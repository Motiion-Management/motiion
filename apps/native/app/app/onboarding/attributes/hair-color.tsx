import React from 'react'

import { HairColorForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function HairColorScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <HairColorForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}