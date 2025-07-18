/**
 * Next.js Configuration Patterns for Motiion
 * 
 * This file contains common configuration patterns used in the Motiion web app
 * that can be referenced when setting up new Next.js projects.
 */

export const motiionNextConfigPatterns = {
  // PWA Configuration with Serwist
  pwa: {
    swSrc: 'app/sw.ts',
    swDest: 'public/sw.js',
    cacheOnNavigation: true
  },

  // Image optimization for Convex
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.convex.cloud', port: '' }
    ]
  },

  // Clerk authentication environment variables
  clerkEnvVars: {
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: '/talent/home',
    NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: '/onboarding/1',
    NEXT_PUBLIC_ENV: process.env.NODE_ENV
  },

  // Rewrites pattern for marketing site
  marketingSiteRewrite: {
    source: '/',
    destination: 'https://motiion.framer.website/'
  }
} as const

/**
 * Example Next.js config using these patterns:
 * 
 * import withSerwistInit from '@serwist/next'
 * import { motiionNextConfigPatterns } from '@packages/web-ui/config/next-config-patterns'
 * 
 * const withSerwist = withSerwistInit(motiionNextConfigPatterns.pwa)
 * 
 * export default withSerwist({
 *   images: motiionNextConfigPatterns.images,
 *   env: motiionNextConfigPatterns.clerkEnvVars,
 *   async rewrites() {
 *     return [motiionNextConfigPatterns.marketingSiteRewrite]
 *   }
 * })
 */