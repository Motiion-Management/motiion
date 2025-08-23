import React from 'react'

import { SkillsForm } from '~/components/forms/onboarding'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'

export default function SkillsScreen() {
  const flow = useOnboardingGroupFlow()

  const handleComplete = async () => {
    flow.navigateToNextStep()
  }

  return (
    <SkillsForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}
