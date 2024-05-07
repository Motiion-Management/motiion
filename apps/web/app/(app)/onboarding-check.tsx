'use client'
import { useEffect } from 'react'
import { api } from '@packages/backend/convex/_generated/api'
import { ONBOARDING_STEPS } from '@packages/backend/convex/users'
import { useQuery } from 'convex/react'
import { redirect, usePathname } from 'next/navigation'

export function OnboardingCheck() {
  const data = useQuery(api.users.getMyUser)

  const pathname = usePathname()

  useEffect(() => {
    if (!data) return
    const onboardingTarget = `/onboarding/${data.onboardingStep}`
    if (
      data.onboardingStep !== ONBOARDING_STEPS.COMPLETE &&
      onboardingTarget !== pathname
    ) {
      redirect(onboardingTarget)
    }
  }, [data, pathname])

  return <></>
}
