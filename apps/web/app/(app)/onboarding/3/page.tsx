'use client'
import placeholder from '@/public/images/upload-image-placeholder.png'
import { HeadshotUploadButton } from '@/components/ui/headshot-upload-button'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { ONBOARDING_STEPS } from '@packages/backend/convex/users'
import { useState } from 'react'
import { HeadshotCarousel } from '@/components/features/headshot-carousel'

export default function Headshot() {
  const headshots = useQuery(api.resumes.getMyHeadshots)
  const removeHeadshot = useMutation(api.resumes.removeHeadshot)
  const headshotsExist = headshots && headshots.length > 0
  const updateMyUser = useMutation(api.users.updateMyUser)
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
    <section className="mt-4 grid h-full w-full grid-cols-1 grid-rows-[1fr_min-content] gap-8">
      <HeadshotCarousel
        title="Headhots"
        placeholderText={`Upload at least one headshot to continue setting up your account. Your headshot(s) will be viewable to the public.`}
        placeholderImage={placeholder}
        onboarding
      />
      <div className="sticky bottom-0 w-full ">
        {headshotsExist ? (
          <Button onClick={nextStep} className="w-full" loading={loading}>
            Continue
          </Button>
        ) : (
          <HeadshotUploadButton className="w-full" />
        )}
      </div>
    </section>
  )
}
