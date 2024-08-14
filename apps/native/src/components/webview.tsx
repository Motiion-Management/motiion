import { useState, useEffect, useRef } from 'react'
import { WebView as RNWebView, WebViewNavigation } from 'react-native-webview'
import { useAuth } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { Button } from './nativewindui/Button'
import { Text } from './nativewindui/Text'

const baseURL = process.env.EXPO_PUBLIC_WEB_SERVER || 'http://jake.local:3000'

export default function WebView({ path }) {
  const [token, setToken] = useState<string>()

  const uri = new URL(path || '404', baseURL)

  const { getToken, signOut, sessionId } = useAuth()
  getToken().then((token) => setToken(token))

  uri.searchParams.set('sessionId', sessionId)

  const [currentURI, setURI] = useState(uri.toString())

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
    // if (url.includes(baseURL)) {
    //   // webviewRef.current?.stopLoading()
    //   console.log('path: ', url.replace(baseURL, ''))
    //   router.navigate(url.replace(baseURL, ''))
    // } else if (url.startsWith('/')) {
    //   // webviewRef.current?.stopLoading()
    if (url === '/sign-out') {
      signOutAndNavigate()
    }
    // else {
    //     router.navigate(url)
    //   }
    // } else {
    //   WebBrowser.openBrowserAsync(url)
    // }
  }

  const [signInToken, setSignInToken] = useState<string>()

  // useEffect(() => {
  //   fetch('https://api.clerk.dev/v1/tokens/sign-in-token', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${process.env.CLERK_API_KEY}`
  //     },
  //     body: JSON.stringify({
  //       user_id: userId
  //     })
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setSignInToken(data.token)
  //       console.log('signInToken: ', data)
  //     })
  //     .catch((err) => console.error('error fetching', err))
  // }, [])
  // fetch a signin token from clerk api
  const newSource = {
    // uri: `/sign-in-token?token=${signInToken}`,
    uri: currentURI,
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  return (
    <>
      <Button className="h-10" onPress={() => signOutAndNavigate()}>
        <Text>Sign Out</Text>
      </Button>
      {token && (
        <RNWebView
          sharedCookiesEnabled
          ref={webviewRef}
          source={newSource}
          onShouldStartLoadWithRequest={(request) => {
            console.log('request:', request.url)
            console.log('currentURI:', currentURI)
            console.log()
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
