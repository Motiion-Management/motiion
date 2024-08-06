import '../global.css'
import 'expo-dev-client'
// import 'react-native-reanimated'

import { Stack } from 'expo-router'
import ConvexClientProvider from '@/ConvexClientProvider'
import { LightHeader } from '@/components/header'
import { StatusBar } from 'expo-status-bar'
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native'

import { useColorScheme, useInitialAndroidBarSync } from '@/lib/useColorScheme'
import { NAV_THEME } from '@/theme'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  )
}

export default function RootLayout() {
  useInitialAndroidBarSync()
  const { colorScheme, isDarkColorScheme } = useColorScheme()

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />

      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <ConvexClientProvider>
          <Stack screenOptions={{ header: LightHeader }}>
            {/* <Stack screenOptions={{ headerShown: false }}> */}
            <Stack.Screen name="(app)" />
            {/* <Stack.Screen name="sign-in" /> */}
            {/* <Stack.Screen name="sign-up" /> */}
            <Stack.Screen name="index" />
          </Stack>
        </ConvexClientProvider>
      </NavThemeProvider>
    </>
  )
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router'
