import { Stack } from 'expo-router'
import ConvexClientProvider from '@/ConvexClientProvider'
import { LightHeader } from '@/components/header'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  )
}

export default function RootLayout() {
  return (
    <ConvexClientProvider>
      <Stack screenOptions={{ header: LightHeader }}>
        {/* <Stack screenOptions={{ headerShown: false }}> */}
        <Stack.Screen name="(app)" />
        {/* <Stack.Screen name="sign-in" /> */}
        {/* <Stack.Screen name="sign-up" /> */}
        <Stack.Screen name="index" />
      </Stack>
    </ConvexClientProvider>
  )
}
