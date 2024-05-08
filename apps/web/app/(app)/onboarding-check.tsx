import { ONBOARDING_STEPS } from '@packages/backend/convex/users'
import { OnboardingCheckClient } from './onboarding-check-client'
import { api } from '@packages/backend/convex/_generated/api'
import { fetchQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

function checkOnboardingStep(currentStep: number, pathname: string) {
  const currentTarget = `/onboarding/${currentStep}`
  if (currentStep !== ONBOARDING_STEPS.COMPLETE && pathname !== currentTarget) {
    return currentTarget
  }
}

export async function OnboardingCheck() {
  const token = await getAuthToken()
  const user = await fetchQuery(api.users.getMyUser, {}, { token })

  const pathname = headers().get('x-pathname')

  if (user && pathname) {
    const redirectTarget = checkOnboardingStep(user.onboardingStep, pathname)
    if (redirectTarget) {
      redirect(redirectTarget)
    }
  }

  return <OnboardingCheckClient />
}
