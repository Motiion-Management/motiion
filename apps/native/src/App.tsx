import { View, StatusBar, Platform } from 'react-native'
import { useFonts } from 'expo-font'
import { LogBox } from 'react-native'
import Navigation from '@/navigation/Navigation'
import ConvexClientProvider from './ConvexClientProvider'

export default function App() {
  LogBox.ignoreLogs(['Warning: ...'])
  LogBox.ignoreAllLogs()

  const [loaded] = useFonts({
    Bold: require('./src/assets/fonts/Montserrat-Bold.ttf'),
    SemiBold: require('./src/assets/fonts/Montserrat-SemiBold.ttf'),
    Medium: require('./src/assets/fonts/Montserrat-Medium.ttf'),
    Regular: require('./src/assets/fonts/Montserrat-Regular.ttf'),
    Light: require('./src/assets/fonts/Montserrat-Light.ttf')
  })
  if (!loaded) {
    return false
  }

  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight

  return (
    <ConvexClientProvider>
      <View style={{ flex: 1 }}>
        <View style={{ height: STATUS_BAR_HEIGHT, backgroundColor: '#0D87E1' }}>
          <StatusBar
            translucent
            backgroundColor={'#0D87E1'}
            barStyle="light-content"
          />
        </View>
        <Navigation />
      </View>
    </ConvexClientProvider>
  )
}
