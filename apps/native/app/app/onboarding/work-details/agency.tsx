import React from 'react'

import { AgencyForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function AgencyScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <AgencyForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}
