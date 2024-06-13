import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getMiddlewareAuthToken } from './lib/server/utils'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { ONBOARDING_STEPS } from '@packages/backend/convex/validators/users'
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/talent(.*)',
  '/onboarding(.*)',
  '/[...segments](.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect()
    const token = await getMiddlewareAuthToken(auth)
    const data = await fetchQuery(api.users.getMyUser, {}, { token })
    if (data) {
      const { onboardingStep } = data
      const onboardingTarget = `/onboarding/${onboardingStep}`
      if (
        onboardingStep !== ONBOARDING_STEPS.COMPLETE &&
        req.nextUrl.pathname !== onboardingTarget
      ) {
        return NextResponse.redirect(new URL(onboardingTarget, req.url))
      }
    }
  }
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', req.nextUrl.pathname)

  return NextResponse.next({
    headers: requestHeaders
  })
})

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
