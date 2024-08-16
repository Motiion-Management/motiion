import { useState, useEffect, useRef } from 'react'
import { WebView as RNWebView, WebViewNavigation } from 'react-native-webview'
import { useAuth } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { Button } from './nativewindui/Button'
import { Text } from './nativewindui/Text'

const baseURL = process.env.EXPO_PUBLIC_WEB_SERVER || 'http://jake.local:3000'

function getSignInTokenUrl({ path, token }: { path: string; token: string }) {
  const url = new URL('/sign-in-token', baseURL)

  url.searchParams.set('token', token)
  url.searchParams.set('path', path)

  return url
}

export default function WebView({ path }) {
  const [token, setToken] = useState<string>()
  const [signInToken, setSignInToken] = useState<string>()

  const { getToken, signOut, sessionId, userId } = useAuth()
  getToken({ template: 'app_transfer' }).then((token) => setToken(token))

  const url = new URL(path, baseURL)
  url.searchParams.set('sessionId', sessionId)

  const [currentURI, setURI] = useState<string>(url.toString())

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

  // useEffect(() => {
  //   const signInPath = new URL('/api/create-sign-in-token', baseURL)
  //   if (token && !signInToken) {
  //     const getSignInToken = async () => {
  //       try {
  //         const res = await fetch(signInPath, {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${token}`
  //           },
  //           body: JSON.stringify({
  //             user_id: userId
  //           })
  //         })
  //
  //         const data = await res.json()
  //         console.log('data:', data)
  //         setSignInToken(data.token)
  //         const signInTokenUrl = getSignInTokenUrl({
  //           path,
  //           token: data.token
  //         })
  //         signInTokenUrl.searchParams.set('sessionId', sessionId)
  //         setURI(signInTokenUrl.toString())
  //       } catch (err) {
  //         console.error('error fetching', err)
  //       }
  //     }
  //
  //     getSignInToken()
  //   }
  // }, [token, userId, signInToken])
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
      {currentURI && (
        <RNWebView
          sharedCookiesEnabled
          ref={webviewRef}
          source={newSource}
          // onShouldStartLoadWithRequest={(request) => {
          //   console.log('request:', request.url)
          //   console.log('currentURI:', currentURI)
          //   console.log()
          //   // If we're loading the current URI, allow it to load
          //   if (request.url === currentURI) return true
          //   // We're loading a new URL -- change state first
          //   setURI(request.url)
          //   return false
          // }}
          onNavigationStateChange={handleNavigationStateChange}
        />
      )}
    </>
  )
}
