'use client'
import { useUser, useSignIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Loading from '@/app/(app)/loading'

export default function AcceptToken() {
  const { signIn, setActive } = useSignIn()
  const { user } = useUser()
  const [signInProcessed, setSignInProcessed] = useState<boolean>(false)
  const signInToken = useSearchParams().get('token')
  const destination = useSearchParams().get('path')

  const router = useRouter()

  useEffect(() => {
    if (!signIn || !setActive || !signInToken) {
      return
    }

    console.log('signInToken', signInToken)

    const createSignIn = async () => {
      try {
        // Create a signIn with the token.
        // Note that you need to use the "ticket" strategy.
        const res = await signIn.create({
          strategy: 'ticket',
          ticket: signInToken as string
        })
        setActive({
          session: res.createdSessionId,
          beforeEmit: () => setSignInProcessed(true)
        })
      } catch (err) {
        setSignInProcessed(true)
      }
    }

    createSignIn()
  }, [signIn, setActive])

  if (!signInToken || !user) {
    router.replace('/sign-in')
  }
  if (!signInProcessed) {
    router.replace(destination || '/')
  }

  return <Loading />
}
