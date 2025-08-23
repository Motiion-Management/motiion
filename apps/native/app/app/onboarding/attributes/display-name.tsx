import React from 'react'

import { DisplayNameForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function DisplayNameScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <DisplayNameForm
      mode="fullscreen"
      autoFocus={true}
      onComplete={handleComplete}
    />
  )
}