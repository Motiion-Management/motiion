import React, { useEffect, useRef, useState } from 'react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { WorkLocationForm, type WorkLocationValues } from '~/components/forms/onboarding/WorkLocationForm'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import { useOnboardingData } from '~/hooks/useOnboardingData'
import { STEP_REGISTRY } from '~/onboarding/registry'
import type { FormHandle } from '~/components/forms/onboarding/contracts'

export default function WorkLocationScreen() {
  const flow = useOnboardingGroupFlow()
  const { data, isLoading } = useOnboardingData()
  const updateUser = useMutation(api.users.updateMyUser)

  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const [initialValues, setInitialValues] = useState<WorkLocationValues | null>(null)

  useEffect(() => {
    if (isLoading) return
    const res = STEP_REGISTRY['work-location'].getInitialValues(data)
    Promise.resolve(res).then((vals) => setInitialValues(vals as WorkLocationValues))
  }, [data, isLoading])

  const handleSubmit = async (values: WorkLocationValues) => {
    const workLocations = values.locations
      .filter(Boolean)
      .map((loc) => `${(loc as any).city}, ${(loc as any).state}`)
    await updateUser({ workLocation: workLocations })
    flow.navigateToNextStep()
  }

  if (isLoading || !initialValues) return null

  return (
    <BaseOnboardingScreen
      title="Where can you work as a local?"
      description=""
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}
    >
      <WorkLocationForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}
