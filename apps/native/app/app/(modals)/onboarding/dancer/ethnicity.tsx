import React, { useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

import { EthnicityForm } from '~/components/forms/onboarding/EthnicityForm'
import type { FormHandle } from '~/components/forms/onboarding/contracts'
import type { EthnicityValues } from '~/components/forms/onboarding/EthnicityForm'
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'

export default function DancerEthnicityScreen() {
  const router = useRouter()
  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {})
  const patchDancerAttributes = useMutation(api.dancers.patchDancerAttributes)

  const handleSubmit = async (values: EthnicityValues) => {
    try {
      await patchDancerAttributes({ attributes: { ethnicity: values.ethnicity } })
      // TODO: Navigate to next step in dancer flow (hair color)
      // router.push('/onboarding/dancer/hair-color' as any)
      router.back()
    } catch (error) {
      console.error('Failed to save ethnicity:', error)
    }
  }

  if (dancerProfile === undefined) {
    return null // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Ethnicity"
      description="Select all that apply."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <EthnicityForm
        ref={formRef}
        initialValues={{
          ethnicity: dancerProfile?.attributes?.ethnicity || [],
        }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}
