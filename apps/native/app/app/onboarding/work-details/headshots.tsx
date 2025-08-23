import React from 'react'

import { HeadshotsForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function HeadshotsScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <HeadshotsForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}
