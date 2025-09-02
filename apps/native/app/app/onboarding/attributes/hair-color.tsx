import React, { useEffect, useRef, useState } from 'react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { HairColorForm, type HairColorValues } from '~/components/forms/onboarding/HairColorForm'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import { useOnboardingData } from '~/hooks/useOnboardingData'
import { STEP_REGISTRY } from '~/onboarding/registry'
import type { FormHandle } from '~/components/forms/onboarding/contracts'

export default function HairColorScreen() {
  const flow = useOnboardingGroupFlow()
  const { data, isLoading } = useOnboardingData()
  const patchUserAttributes = useMutation(api.users.patchUserAttributes)

  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const [initialValues, setInitialValues] = useState<HairColorValues | null>(null)

  useEffect(() => {
    if (isLoading) return
    const res = STEP_REGISTRY['hair-color'].getInitialValues(data)
    Promise.resolve(res).then((vals) => setInitialValues(vals as HairColorValues))
  }, [data, isLoading])

  const handleSubmit = async (values: HairColorValues) => {
    await patchUserAttributes({ attributes: { hairColor: values.hairColor } })
    flow.navigateToNextStep()
  }

  if (isLoading || !initialValues) return null

  return (
    <BaseOnboardingScreen
      title="What color is your hair?"
      description="Select one"
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}
    >
      <HairColorForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}
