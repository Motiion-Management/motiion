import React, { useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

import { UnionForm } from '~/components/forms/onboarding/UnionForm'
import type { FormHandle } from '~/components/forms/onboarding/contracts'
import type { UnionValues } from '~/components/forms/onboarding/UnionForm'
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen'

export default function DancerSagAftraScreen() {
  const router = useRouter()
  const formRef = useRef<FormHandle>(null)
  const [canSubmit, setCanSubmit] = useState(false)

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {})
  const updateDancerProfile = useMutation(api.dancers.updateMyDancerProfile)

  const handleSubmit = async (values: UnionValues) => {
    try {
      await updateDancerProfile({
        sagAftraId: values.sagAftraId || undefined
      })
      router.back()
    } catch (error) {
      console.error('Failed to save SAG-AFTRA ID:', error)
    }
  }

  if (dancerProfile === undefined) {
    return null // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Union Membership"
      description="Are you a SAG-AFTRA member? Enter your ID if applicable."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <UnionForm
        ref={formRef}
        initialValues={{
          sagAftraId: dancerProfile?.sagAftraId || '',
        }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  )
}
