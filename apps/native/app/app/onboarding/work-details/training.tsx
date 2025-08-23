import React from 'react'

import { TrainingForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function TrainingScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <TrainingForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}
