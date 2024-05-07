import { ClerkMiddlewareAuth, auth } from '@clerk/nextjs/server'

export async function getAuthToken() {
  return (await auth().getToken({ template: 'convex' })) ?? undefined
}

export async function getMiddlewareAuthToken(clerkAuth: ClerkMiddlewareAuth) {
  return (await clerkAuth().getToken({ template: 'convex' })) ?? undefined
}
