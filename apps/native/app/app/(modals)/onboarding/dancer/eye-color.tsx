import React, { useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

import { EyeColorForm } from '~/components/forms/onboarding/EyeColorForm'
import type { FormHandle } from '~/components/forms/onboarding/contracts'
import type { EyeColorValues } from '~/components/forms/onboarding/EyeColorForm'
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'

export default function DancerEyeColorScreen() {
  const router = useRouter()
  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {})
  const patchDancerAttributes = useMutation(api.dancers.patchDancerAttributes)

  const handleSubmit = async (values: EyeColorValues) => {
    try {
      await patchDancerAttributes({ attributes: { eyeColor: values.eyeColor } })
      // TODO: Navigate to next step in dancer flow (gender)
      // router.push('/onboarding/dancer/gender' as any)
      router.back()
    } catch (error) {
      console.error('Failed to save eye color:', error)
    }
  }

  if (dancerProfile === undefined) {
    return null // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Eye color"
      description="Select your eye color."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <EyeColorForm
        ref={formRef}
        initialValues={{
          eyeColor: dancerProfile?.attributes?.eyeColor || 'Brown',
        }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}
