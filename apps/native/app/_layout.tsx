import { Stack } from 'expo-router'
// import * as SecureStore from 'expo-secure-store'
// import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { StatusBar, Platform, View } from 'react-native'
import ConvexClientProvider from '@/ConvexClientProvider'
//
// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       const item = await SecureStore.getItemAsync(key)
//       if (item) {
//         console.log(`${key} was used 🔐 \n`)
//       } else {
//         console.log('No values stored under key: ' + key)
//       }
//       return item
//     } catch (error) {
//       console.error('SecureStore get item error: ', error)
//       await SecureStore.deleteItemAsync(key)
//       return null
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       return SecureStore.setItemAsync(key, value)
//     } catch (err) {
//       return
//     }
//   }
// }

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  )
}

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight

function Header() {
  return (
    <View style={{ height: STATUS_BAR_HEIGHT }}>
      <StatusBar translucent />
    </View>
  )
}

export default function RootLayout() {
  return (
    <ConvexClientProvider>
      <Stack screenOptions={{ header: Header }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="index" />
      </Stack>
    </ConvexClientProvider>
  )
}
