import { useState, useRef } from 'react'
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

  const [currentURI, setURI] = useState(uri.toString())

  const { getToken, signOut } = useAuth()
  getToken().then((token) => setToken(token))

  console.log('token:', token)
  console.log('uri:', uri.toString())

  function signOutAndNavigate() {
    signOut()
    router.navigate('/(auth)')
  }

  const webviewRef = useRef<RNWebView>(null)

  function handleNavigationStateChange(navState: WebViewNavigation) {
    const { url } = navState
    if (!url) return

    console.log('URL:', url)
    if (url.includes(baseURL)) {
      // webviewRef.current?.stopLoading()
      console.log('path: ', url.replace(baseURL, ''))
      router.navigate(url.replace(baseURL, ''))
    } else if (url.startsWith('/')) {
      // webviewRef.current?.stopLoading()
      if (url === '/sign-out') {
        signOutAndNavigate()
      } else {
        router.navigate(url)
      }
    } else {
      WebBrowser.openBrowserAsync(url)
    }
  }

  return (
    <>
      <Button className="h-10" onPress={() => signOutAndNavigate()}>
        <Text>Sign Out</Text>
      </Button>
      {token && (
        <RNWebView
          ref={webviewRef}
          source={{
            uri: currentURI,
            headers: {
              Authorization: `Bearer ${token}`
            }
          }}
          onShouldStartLoadWithRequest={(request) => {
            // If we're loading the current URI, allow it to load
            if (request.url === currentURI) return true
            // We're loading a new URL -- change state first
            setURI(request.url)
            return false
          }}
          onNavigationStateChange={handleNavigationStateChange}
        />
      )}
    </>
  )
}
