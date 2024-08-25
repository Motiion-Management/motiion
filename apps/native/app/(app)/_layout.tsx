import { Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'

export default function RootLayout() {
  const { isSignedIn } = useAuth()
  if (!isSignedIn) {
    return <Redirect href={'/sign-in'} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="talent" />
    </Stack>
  )
}
