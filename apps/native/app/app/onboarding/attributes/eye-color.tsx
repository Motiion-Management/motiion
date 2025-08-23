import React from 'react'

import { EyeColorForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function EyeColorScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <EyeColorForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}