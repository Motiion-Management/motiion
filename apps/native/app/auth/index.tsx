import { Link, Redirect } from 'expo-router';
import React from 'react';
import { ImageBackground, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAuthenticated } from '~/hooks/useAuthenticated';

export default function AuthLandingScreen() {
  const { isAuthenticated, isLoading } = useAuthenticated();

  // If user is signed in, redirect to app
  if (isAuthenticated && !isLoading) {
    return <Redirect href="/app" />;
  }

  // Show landing page for unauthenticated users
  return (
    <ImageBackground source={require('../background.png')} className="h-full">
      <SafeAreaView style={{ flex: 1 }}>
        <View className="mt-[25%] flex w-full items-center">
          <Text variant="largeTitle" color="utilityLight">
            motiion
          </Text>
        </View>
        <View className="ios:justify-end flex-1 justify-center gap-4 px-6 py-4">
          <View className="ios:pt-2 pb-8">
            <Text variant="bodySm" className="text-center text-text-utility-light">
              By creating an account, you agree to our{' '}
              <Link
                className="text-link-sm text-accent underline"
                href="/(modals)/terms-and-conditions">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link className="text-link-sm text-accent underline" href="/(modals)/privacy-policy">
                Privacy Policy
              </Link>
              .
            </Text>
          </View>
          <Link href="/auth/(create-account)" asChild>
            <Button variant="primary" size={Platform.select({ ios: 'lg', default: 'md' })}>
              <Text>Create Account</Text>
            </Button>
          </Link>

          <Link href="/auth/(login)" asChild>
            <Button variant="tertiary" size={Platform.select({ ios: 'lg', default: 'md' })}>
              <Text>Sign In</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
