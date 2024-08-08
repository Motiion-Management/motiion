import { Stack } from 'expo-router'

export default function SettingsLayout() {
  return (
    <>
      <Stack screenOptions={SCREEN_OPTIONS} />
    </>
  )
}

const SCREEN_OPTIONS = {
  animation: 'ios', // for android
  headerShown: false
} as const
