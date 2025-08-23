import React from 'react'

import { EthnicityForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function EthnicityScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <EthnicityForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}