import WelcomeConsentScreen from '@/components/screens/welcome-consent'
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'

export default function Splash() {
  const { isSignedIn } = useAuth()
  console.log(isSignedIn)
  if (!isSignedIn) {
    return <Redirect href={'/sign-in'} />
  }
  return (
    <>
      <SignedIn>
        <Redirect href={'/talent/home'} />
      </SignedIn>
      <SignedOut>
        <WelcomeConsentScreen />
      </SignedOut>
    </>
  )
}
