import React from 'react'

import { GenderForm } from '~/components/forms/onboarding'
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function GenderScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <GenderForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}