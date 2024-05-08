import { ONBOARDING_STEPS } from '@packages/backend/convex/users'
import { OnboardingCheckClient } from './onboarding-check-client'
import { api } from '@packages/backend/convex/_generated/api'
import { fetchQuery, preloadQuery } from 'convex/nextjs'
import { getAuthToken } from '@/lib/server/utils'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

function checkOnboardingStep(currentStep: number, pathname: string) {
  const currentTarget = `/onboarding/${currentStep}`
  console.log('currentTarget', currentTarget)
  console.log('pathname', pathname)
  if (currentStep !== ONBOARDING_STEPS.COMPLETE && pathname !== currentTarget) {
    return currentTarget
  }
}

export async function OnboardingCheck() {
  const token = await getAuthToken()
  const user = await fetchQuery(api.users.getMyUser, {}, { token })
  const preloadedUser = await preloadQuery(api.users.getMyUser, {}, { token })

  const pathname = headers().get('x-pathname')

  console.log('user', user)
  console.log('preloadedUser', preloadedUser)
  console.log('pathname', pathname)
  if (user && pathname) {
    const redirectTarget = checkOnboardingStep(user.onboardingStep, pathname)

    console.log('redirectTarget', redirectTarget)
    if (redirectTarget) {
      redirect(redirectTarget)
    }
  }

  return <OnboardingCheckClient preloadedUser={preloadedUser} />
}
