import { router } from 'expo-router'
import React from 'react'

import { ResumeForm } from '~/components/forms/onboarding'

export default function ResumeScreen() {
  const handleComplete = async () => {
    // Navigate to next group (attributes)
    router.push('/app/onboarding/attributes')
  }

  return (
    <ResumeForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}