import { Link, Stack } from 'expo-router'
import { Platform } from 'react-native'

import { Text } from '@/components/nativewindui/Text'
import { Button } from '@/components/nativewindui/Button'

export default function AuthLayout() {
  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" options={LOGIN_MODAL_OPTIONS} />
      <Stack.Screen name="sign-up" options={CREATE_ACCOUNT_MODAL_OPTIONS} />
    </Stack>
  )
}

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'ios' // for android
} as const

const LOGIN_MODAL_OPTIONS = {
  presentation: 'modal',
  animation: 'ios', // for android
  headerShown: false
} as const

const CREATE_ACCOUNT_MODAL_OPTIONS = {
  presentation: 'modal',
  animation: 'ios', // for android
  headerShown: Platform.OS === 'ios',
  headerShadowVisible: false,
  headerLeft() {
    return (
      <Link asChild href="/">
        <Button variant="plain" className="ios:px-0">
          <Text className="text-primary">Cancel</Text>
        </Button>
      </Link>
    )
  }
} as const