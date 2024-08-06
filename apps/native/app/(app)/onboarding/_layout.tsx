import { DarkHeader } from '@/components/header'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack screenOptions={{ header: DarkHeader }}>
      <Stack.Screen name="1" />
      <Stack.Screen name="2" />
      <Stack.Screen name="3" />
      <Stack.Screen name="4" />
    </Stack>
  )
}
