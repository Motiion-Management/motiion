import React, { useEffect, useRef, useState } from 'react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { EthnicityForm, type EthnicityValues } from '~/components/forms/onboarding/EthnicityForm'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import { useOnboardingData } from '~/hooks/useOnboardingData'
import { STEP_REGISTRY } from '~/onboarding/registry'
import type { FormHandle } from '~/components/forms/onboarding/contracts'

export default function EthnicityScreen() {
  const flow = useOnboardingGroupFlow()
  const { data, isLoading } = useOnboardingData()
  const patchUserAttributes = useMutation(api.users.patchUserAttributes)

  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const [initialValues, setInitialValues] = useState<EthnicityValues | null>(null)

  useEffect(() => {
    if (isLoading) return
    const res = STEP_REGISTRY['ethnicity'].getInitialValues(data)
    Promise.resolve(res).then((vals) => setInitialValues(vals as EthnicityValues))
  }, [data, isLoading])

  const handleSubmit = async (values: EthnicityValues) => {
    await patchUserAttributes({ attributes: { ethnicity: values.ethnicity } })
    flow.navigateToNextStep()
  }

  if (isLoading || !initialValues) return null

  return (
    <BaseOnboardingScreen
      title="What's your ethnicity?"
      description="Select all that apply"
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}
    >
      <EthnicityForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}
