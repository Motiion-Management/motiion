import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { getMiddlewareAuthToken } from './lib/server/utils'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { ONBOARDING_STEPS } from '@packages/backend/convex/users'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/home(.*)',
  '/discover(.*)',
  '/profile(.*)',
  '/settings(.*)',
  '/onboarding(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect()
    const token = await getMiddlewareAuthToken(auth)
    const data = await fetchQuery(api.users.getMyUser, {}, { token })
    const { onboardingStep } = data!
    const onboardingTarget = `/onboarding/${onboardingStep}`
    if (
      onboardingStep !== ONBOARDING_STEPS.COMPLETE &&
      req.nextUrl.pathname !== onboardingTarget
    ) {
      return NextResponse.redirect(new URL(onboardingTarget, req.url))
    }
  }
})

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
