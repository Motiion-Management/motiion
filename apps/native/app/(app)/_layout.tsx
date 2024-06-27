import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(talent)" />
    </Stack>
  )
}
