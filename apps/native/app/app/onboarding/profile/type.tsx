import { router } from 'expo-router'
import React from 'react'

import { ProfileTypeForm } from '~/components/forms/onboarding'

export default function ProfileTypeScreen() {
  const handleComplete = async () => {
    // Navigate to next step in profile group
    router.push('/app/onboarding/profile/resume')
  }

  return (
    <ProfileTypeForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  )
}