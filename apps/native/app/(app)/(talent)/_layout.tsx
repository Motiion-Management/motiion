import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
    </Stack>
  )
}
