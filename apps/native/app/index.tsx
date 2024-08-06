import { SignedIn, useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import { Text } from 'react-native'

export default function Splash() {
  const { isSignedIn } = useAuth()
  console.log(isSignedIn)
  if (!isSignedIn) {
    return <Redirect href={'/sign-in'} />
  }
  return (
    <SignedIn>
      <Redirect href={'/talent/home'} />
    </SignedIn>
  )
}
