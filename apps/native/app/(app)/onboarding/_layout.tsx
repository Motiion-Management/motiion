import { Stack } from 'expo-router'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function OnboardingLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
    </SafeAreaView>
  )
}