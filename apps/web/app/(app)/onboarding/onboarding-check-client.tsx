'use client'

import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { ONBOARDING_STEPS } from '@packages/backend/convex/validators/users'

function checkOnboardingStep(currentStep: number, pathname: string) {
  const currentTarget = `/onboarding/${currentStep}`
  if (currentStep !== ONBOARDING_STEPS.COMPLETE && pathname !== currentTarget) {
    return currentTarget
  }
}

export function OnboardingCheckClient() {
  const pathname = usePathname()
  const router = useRouter()

  const user = useQuery(api.users.getMyUser)

  const onboardingStep = user?.onboardingStep

  useEffect(() => {
    if (!onboardingStep) return
    const redirectTarget = checkOnboardingStep(onboardingStep, pathname)
    if (redirectTarget) {
      router.push(redirectTarget)
    }
  }, [onboardingStep, pathname, router])

  return <></>
}
