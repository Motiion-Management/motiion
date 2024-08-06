import { useState } from 'react'
import { WebView as RNWebView, WebViewNavigation } from 'react-native-webview'
import { useAuth } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { Button } from './nativewindui/Button'
import { Text } from './nativewindui/Text'
import { View } from 'react-native'

const baseURL = process.env.EXPO_PUBLIC_WEB_SERVER || 'http://jake.local:3000'

export default function WebView({ path }) {
  const [token, setToken] = useState<string>()

  const uri = new URL(path || '404', baseURL)

  // const [currentURI, setURI] = useState(uri.toString())

  const { getToken, signOut } = useAuth()
  getToken().then((token) => setToken(token))

  console.log('token:', token)
  console.log('uri:', uri.toString())

  function handleNavigationStateChange(navState: WebViewNavigation) {
    const { url } = navState
    if (!url) return

    console.log('URL:', url)
    if (url.includes(baseURL)) {
      console.log('path: ', url.replace(baseURL, ''))
      router.navigate(url.replace(baseURL, ''))
    } else if (url.startsWith('/')) {
      if (url === '/sign-out') {
        signOut()
      }
      router.navigate(url)
    } else {
      WebBrowser.openBrowserAsync(url)
    }
  }

  return (
    <View>
      <Button onPress={() => signOut()}>
        <Text>Sign Out</Text>
      </Button>
      <RNWebView
        source={{
          uri: uri.toString(),
          headers: {
            Authorization: `Bearer ${token}`
          }
        }}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </View>
  )
}
