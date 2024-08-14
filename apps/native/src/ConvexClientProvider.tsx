'use client'

import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, useAuth, ClerkLoaded } from '@clerk/clerk-expo'
import * as SecureStore from 'expo-secure-store'
import ClerkSessionProvider from './SessionProvider'

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key)
      if (item) {
        console.log(`${key} was used 🔐 \n`)
      } else {
        console.log('No values stored under key: ' + key)
      }
      return item
    } catch (error) {
      console.error('SecureStore get item error: ', error)
      await SecureStore.deleteItemAsync(key)
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      console.log(key, ' SAVED 🔐 AS ', value, '\n')
      return SecureStore.setItemAsync(key, value)
    } catch (err) {
      return
    }
  }
}

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!)

export default function ConvexClientProvider({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ClerkSessionProvider>
        <ClerkLoaded>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
          </ConvexProviderWithClerk>
        </ClerkLoaded>
      </ClerkSessionProvider>
    </ClerkProvider>
  )
}
