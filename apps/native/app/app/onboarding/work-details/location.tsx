import React from 'react'

import { LocationForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function LocationScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <LocationForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}
