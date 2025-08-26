import React, { useEffect, useRef, useState } from 'react'
import { api } from '@packages/backend/convex/_generated/api'
import { useMutation } from 'convex/react'

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'
import { LocationForm, type LocationValues } from '~/components/forms/onboarding/LocationForm'
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow'
import { useOnboardingData } from '~/hooks/useOnboardingData'
import { STEP_REGISTRY } from '~/onboarding/registry'
import type { FormHandle } from '~/components/forms/onboarding/contracts'

export default function LocationScreen() {
  const flow = useOnboardingGroupFlow()
  const { data, isLoading } = useOnboardingData()
  const updateUser = useMutation(api.users.updateMyUser)

  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const [initialValues, setInitialValues] = useState<LocationValues | null>(null)

  useEffect(() => {
    if (isLoading) return
    const res = STEP_REGISTRY['location'].getInitialValues(data)
    Promise.resolve(res).then((vals) => setInitialValues(vals as LocationValues))
  }, [data, isLoading])

  const handleSubmit = async (values: LocationValues) => {
    if (!values.primaryLocation) return
    await updateUser({
      location: {
        city: values.primaryLocation.city,
        state: values.primaryLocation.state,
        country: 'United States',
      },
    })
    flow.navigateToNextStep()
  }

  if (isLoading || !initialValues) return null

  return (
    <BaseOnboardingScreen
      title="Where are you located?"
      description=""
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}
    >
      <LocationForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}
