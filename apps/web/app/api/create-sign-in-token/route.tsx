import { clerkClient, auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  const { isSignedIn } = await clerkClient.authenticateRequest(request)

  const { userId } = auth()

  if (!isSignedIn || !userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const expiresInSeconds = 60 * 60 // 1 hour
  const signInToken = await clerkClient.signInTokens.createSignInToken({
    userId,
    expiresInSeconds
  })

  return new Response(JSON.stringify(signInToken), { status: 200 })
}
