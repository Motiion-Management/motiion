import React, { useRef, useState } from 'react'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { HeadshotsForm } from '~/components/forms/onboarding/HeadshotsForm'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import type { FormHandle } from '~/components/forms/onboarding/contracts'

export default function HeadshotsScreen() {
  const flow = useOnboardingGroupFlow()
  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)

  const handleSubmit = async () => {
    flow.navigateToNextStep()
  }

  return (
    <BaseOnboardingScreen
      title="Headshots"
      description="Upload your professional headshots to showcase your look."
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}
    >
      <HeadshotsForm ref={formRef} initialValues={{}} onSubmit={handleSubmit} onValidChange={setCanSubmit} />
    </BaseOnboardingScreen>
  )
}
