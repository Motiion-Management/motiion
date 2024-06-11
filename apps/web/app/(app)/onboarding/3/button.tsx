'use client'
import { Button } from '@/components/ui/button'
import { HeadshotUploadButton } from '@/components/ui/headshot-upload-button'
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { ONBOARDING_STEPS } from '@packages/backend/convex/validators/users'
import { api } from '@packages/backend/convex/_generated/api'

export function BottomButton() {
  const headshots = useQuery(api.users.headshots.getMyHeadshots)
  const headshotsExist = headshots && headshots.length > 0
  const updateMyUser = useMutation(api.users.updateMyUser)
  const [loading, setLoading] = useState(false)

  async function nextStep() {
    setLoading(true)
    await updateMyUser({
      onboardingStep: ONBOARDING_STEPS.RESUME
    })
  }

  return (
    <>
      {headshotsExist ? (
        <Button onClick={nextStep} className="w-full" loading={loading}>
          Continue
        </Button>
      ) : (
        <HeadshotUploadButton className="w-full" />
      )}
    </>
  )
}
