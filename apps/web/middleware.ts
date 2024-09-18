import {
  // clerkClient,
  clerkMiddleware,
  createRouteMatcher
} from '@clerk/nextjs/server'
import {
  // NextRequest,
  NextResponse
} from 'next/server'
import { getMiddlewareAuthToken } from './lib/server/utils'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@packages/backend/convex/_generated/api'
import { ONBOARDING_STEPS } from '@packages/backend/convex/validators/users'
// import * as clerkNode from '@clerk/clerk-sdk-node'
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/talent/profile(.*)',
  '/talent/settings(.*)',
  '/onboarding(.*)',
  '/[...segments](.*)'
])

// async function verifyAppTransferToken(req: NextRequest) {
//   const appTransferToken = req.nextUrl.searchParams.get('app_transfer_token')
//
//   if (!appTransferToken) {
//     return null
//   }
//
//   try {
//     const authResult = await clerkClient.authenticateRequest(req)
//
//     if (
//       authResult.status === 'signed-in' &&
//       authResult.toAuth().sessionClaims.app_transfer
//     ) {
//       return authResult
//     } else {
//       throw new Error('Invalid app transfer token')
//     }
//   } catch (error) {
//     console.error('Token verification failed:', error)
//     return null
//   }
// }

export default clerkMiddleware(
  async (auth, req) => {
    // const authResult = await verifyAppTransferToken(req)

    // claude add code here

    if (isProtectedRoute(req)) {
      auth().protect()
    }
    if (auth().userId) {
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
        } else if (req.nextUrl.pathname === '/') {
          return NextResponse.redirect(new URL('/talent/home', req.url))
        }
      }
    }
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-pathname', req.nextUrl.pathname)
    // requestHeaders.set('authorization', req.headers.get('authorization') || '')

    // console.log('headers', requestHeaders)
    return NextResponse.next({
      headers: requestHeaders
    })
  },
  { debug: true }
)

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  //
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
