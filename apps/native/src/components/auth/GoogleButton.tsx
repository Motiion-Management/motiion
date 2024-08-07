import React from 'react'
import * as WebBrowser from 'expo-web-browser'
import { useOAuth } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text } from '@/components/nativewindui/Text'
import { Button } from '@/components/nativewindui/Button'
import { Alert, Image, Platform } from 'react-native'

const GOOGLE_SOURCE = {
  uri: 'https://www.pngall.com/wp-content/uploads/13/Google-Logo.png'
}

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    // Warm up the android browser to improve UX
    // https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}
export const GoogleButton = () => {
  useWarmUpBrowser()

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow({
          redirectUrl: Linking.createURL('/onboarding/1', { scheme: 'motiion' })
        })

      if (createdSessionId) {
        setActive!({ session: createdSessionId })
      } else {
        Alert.alert(
          'No session ID created. Use signIn or signUp for next steps such as MFA'
        )
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err)
    }
  }, [])

  return (
    <Button
      variant="secondary"
      className="ios:border-foreground/60"
      size={Platform.select({ ios: 'lg', default: 'md' })}
      onPress={onPress}
    >
      <Image
        source={GOOGLE_SOURCE}
        className="absolute left-4 h-4 w-4"
        resizeMode="contain"
      />
      <Text className="ios:text-foreground">Continue with Google</Text>
    </Button>
  )
}
