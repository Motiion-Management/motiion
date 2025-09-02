import React, { useEffect, useRef, useState } from 'react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { EyeColorForm, type EyeColorValues } from '~/components/forms/onboarding/EyeColorForm'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import { useOnboardingData } from '~/hooks/useOnboardingData'
import { STEP_REGISTRY } from '~/onboarding/registry'
import type { FormHandle } from '~/components/forms/onboarding/contracts'

export default function EyeColorScreen() {
  const flow = useOnboardingGroupFlow()
  const { data, isLoading } = useOnboardingData()
  const patchUserAttributes = useMutation(api.users.patchUserAttributes)

  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const [initialValues, setInitialValues] = useState<EyeColorValues | null>(null)

  useEffect(() => {
    if (isLoading) return
    const res = STEP_REGISTRY['eye-color'].getInitialValues(data)
    Promise.resolve(res).then((vals) => setInitialValues(vals as EyeColorValues))
  }, [data, isLoading])

  const handleSubmit = async (values: EyeColorValues) => {
    await patchUserAttributes({ attributes: { eyeColor: values.eyeColor } })
    flow.navigateToNextStep()
  }

  if (isLoading || !initialValues) return null

  return (
    <BaseOnboardingScreen
      title="What color are your eyes?"
      description="Select one"
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}
    >
      <EyeColorForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}
