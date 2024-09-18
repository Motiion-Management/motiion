// import { Link } from 'expo-router'
// import { SignedIn, SignedOut } from '@clerk/clerk-expo'
// import { Redirect } from 'expo-router'
import * as React from 'react'
// import { Image, Platform, View } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'

// import { Text } from '@/components/nativewindui/Text'
import { AlertAnchor } from '@/components/nativewindui/Alert'
import { AlertRef } from '@/components/nativewindui/Alert/types'
// import { Button } from '@/components/nativewindui/Button'
// import { GoogleButton } from '@/components/auth/GoogleButton'
// import { AppleButton } from '@/components/auth/AppleButton'
import WebView from '@/components/simple-webview'

// const LOGO_SOURCE = {
//   uri: 'https://nativewindui.com/_next/image?url=/_next/static/media/logo.28276aeb.png&w=2048&q=75'
// }

export default function AuthIndexScreen() {
  const alertRef = React.useRef<AlertRef>(null)
  return (
    <>
      <WebView path={'/talent/home'} />
      <AlertAnchor ref={alertRef} />
    </>
  )
}
