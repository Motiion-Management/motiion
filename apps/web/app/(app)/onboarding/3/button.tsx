'use client'
import { Button } from '@/components/ui/button'
import { HeadshotUploadButton } from '@/components/ui/headshot-upload-button'
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { ONBOARDING_STEPS } from '@packages/backend/convex/users'
import { api } from '@packages/backend/convex/_generated/api'

export function BottomButton() {
  const headshots = useQuery(api.resumes.getMyHeadshots)
  const headshotsExist = headshots && headshots.length > 0
  const updateMyUser = useMutation(api.users.update)
  const user = useQuery(api.users.getMyUser)
  const [loading, setLoading] = useState(false)

  async function nextStep() {
    setLoading(true)
    await updateMyUser({
      id: user!._id,
      patch: {
        onboardingStep: ONBOARDING_STEPS.RESUME
      }
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
