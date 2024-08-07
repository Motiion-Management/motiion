import React from 'react'
import { useOAuth } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text } from '@/components/nativewindui/Text'
import { Button } from '@/components/nativewindui/Button'
import { Alert, Platform } from 'react-native'

export const AppleButton = () => {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_apple' })

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
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
      <Text className="ios:text-foreground absolute left-4 text-[22px]"></Text>
      <Text className="ios:text-foreground">Continue with Apple</Text>
    </Button>
  )
}
