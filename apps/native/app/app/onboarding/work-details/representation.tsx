import React, { useEffect, useRef, useState } from 'react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { RepresentationFormCore, type RepresentationValues } from '~/components/forms/onboarding/RepresentationFormCore'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import { useOnboardingData } from '~/hooks/useOnboardingData'
import { STEP_REGISTRY } from '~/onboarding/registry'
import type { FormHandle } from '~/components/forms/onboarding/contracts'
import { router } from 'expo-router'

export default function RepresentationScreen() {
  const flow = useOnboardingGroupFlow()
  const { data, isLoading } = useOnboardingData()
  const updateUser = useMutation(api.users.updateMyUser)

  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const [initialValues, setInitialValues] = useState<RepresentationValues | null>(null)

  useEffect(() => {
    if (isLoading) return
    const res = STEP_REGISTRY['representation'].getInitialValues(data)
    Promise.resolve(res).then((vals) => setInitialValues(vals as RepresentationValues))
  }, [data, isLoading])

  const handleSubmit = async (values: RepresentationValues) => {
    await updateUser({ representationStatus: values.representationStatus })
    if (values.representationStatus === 'represented') {
      router.push('/app/onboarding/work-details/agency')
      return
    }
    flow.navigateToNextStep()
  }

  if (isLoading || !initialValues) return null

  return (
    <BaseOnboardingScreen
      title="Are you represented by an agent?"
      description="Select one"
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}
      secondaryAction={{ onPress: () => {}, text: 'Requires Verification' }}
    >
      <RepresentationFormCore
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}
