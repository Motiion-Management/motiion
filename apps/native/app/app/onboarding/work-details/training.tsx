import React, { useRef, useState } from 'react'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { TrainingFormCore } from '~/components/forms/onboarding/TrainingFormCore'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import type { FormHandle } from '~/components/forms/onboarding/contracts'

export default function TrainingScreen() {
  const flow = useOnboardingGroupFlow()
  const formRef = useRef<FormHandle>(null)
  const [canSubmit] = useState(true)

  const handleSubmit = async () => {
    flow.navigateToNextStep()
  }

  return (
    <BaseOnboardingScreen
      title="Add your training"
      description="Add up to 3 training details. People commonly include dance teams, schools, and training programs."
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}
    >
      <TrainingFormCore ref={formRef} initialValues={{}} onSubmit={handleSubmit} />
    </BaseOnboardingScreen>
  )
}
