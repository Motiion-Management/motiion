import React from 'react'

import { HeightForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function HeightScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <HeightForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}