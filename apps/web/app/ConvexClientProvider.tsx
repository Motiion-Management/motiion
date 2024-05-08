'use client'
import { ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function ConvexClientProvider({
  children
}: {
  children: ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      signUpForceRedirectUrl="/onboarding/1"
      appearance={{
        elements: {
          formButtonPrimary: 'bg-secondary hover:bg-primary/90 ',
          input:
            'bg-background !border !border-border text-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:!shadow-none'
        }
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
