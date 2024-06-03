import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  // Note: This is only an example. If you use Pages Router,
  // use something else that works, such as "service-worker/index.ts".
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true
})

export default withSerwist({
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.convex.cloud', port: '' }
    ]
  },
  env: {
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: '/talent/home',
    NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: '/onboarding/1',
    NEXT_PUBLIC_ENV: process.env.NODE_ENV
  }
})
