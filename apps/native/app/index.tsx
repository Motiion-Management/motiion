import WebView from '@/components/webview'
import { SignedIn, useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'

export default function Splash() {
  const { isSignedIn } = useAuth()
  if (!isSignedIn) {
    return <Redirect href={'/sign-in'} />
  }
  return (
    <SignedIn>
      <WebView path="/talent/home" />
    </SignedIn>
  )
}
