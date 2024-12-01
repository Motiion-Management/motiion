import React from 'react'
import { View, StatusBar } from 'react-native'
import { useFonts } from 'expo-font'
import { LogBox } from 'react-native'
import Navigation from './src/navigation/Navigation'
import ConvexClientProvider from './ConvexClientProvider'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function App() {
  LogBox.ignoreLogs(['Warning: ...'])
  LogBox.ignoreAllLogs()

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Bold': require('./src/assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('./src/assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Medium': require('./src/assets/fonts/Inter-Medium.ttf'),
    'Inter-Regular': require('./src/assets/fonts/Inter-Regular.ttf'),
    'Montserrat-Bold': require('./src/assets/fonts/Montserrat-Bold.ttf'),
    'Montserrat-SemiBold': require('./src/assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Medium': require('./src/assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-Regular': require('./src/assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Light': require('./src/assets/fonts/Montserrat-Light.ttf')
  })

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <SafeAreaProvider>
      <ConvexClientProvider>
        <View className="bg-background flex-1">
          <StatusBar barStyle="light-content" backgroundColor="#0D87E1" />
          <Navigation />
        </View>
      </ConvexClientProvider>
    </SafeAreaProvider>
  )
}
