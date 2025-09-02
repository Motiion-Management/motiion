import React, { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { UnionForm, type UnionValues } from '~/components/forms/onboarding/UnionForm'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import { useOnboardingData } from '~/hooks/useOnboardingData'
import { STEP_REGISTRY } from '~/onboarding/registry'
import type { FormHandle } from '~/components/forms/onboarding/contracts'

export default function UnionScreen() {
  const flow = useOnboardingGroupFlow()
  const { data, isLoading } = useOnboardingData()
  const updateMyUser = useMutation(api.users.updateMyUser)

  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const [initialValues, setInitialValues] = useState<UnionValues | null>(null)

  useEffect(() => {
    if (isLoading) return
    const res = STEP_REGISTRY['union'].getInitialValues(data)
    Promise.resolve(res).then((vals) => setInitialValues(vals as UnionValues))
  }, [data, isLoading])

  const handleSubmit = async (values: UnionValues) => {
    await updateMyUser({
      sagAftraId: values.sagAftraId || undefined
    })
    flow.navigateToNextStep()
  }

  const handleSkip = useCallback(() => {
    flow.navigateToNextStep()
  }, [flow])

  if (isLoading || !initialValues) return null

  return (
    <BaseOnboardingScreen
      title="Are you a member of SAG-AFTRA?"
      description="Enter your member ID. Please skip if you are not a member."
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}
      secondaryAction={{
        text: 'Skip for now',
        onPress: handleSkip
      }}
    >
      <UnionForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}