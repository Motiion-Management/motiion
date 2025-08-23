import React from 'react'

import { WorkLocationForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function WorkLocationScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <WorkLocationForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}
