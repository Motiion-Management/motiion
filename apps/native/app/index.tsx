import { Authenticated, Unauthenticated, useConvexAuth } from 'convex/react';
import { Link, Redirect, router } from 'expo-router';
import React, { useEffect } from 'react';
import { ImageBackground, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function RootScreen() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  console.log('🔄 RootScreen: Checking authentication status', { isLoading, isAuthenticated });

  return (
    <>
      <Authenticated>
        <Redirect href="/app" />
      </Authenticated>
      <Unauthenticated>
        <ImageBackground source={require('./background.png')} className="h-full ">
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
                  <Link
                    className="text-link-sm text-accent underline"
                    href="/(modals)/privacy-policy">
                    Privacy Policy
                  </Link>
                  .
                </Text>
              </View>
              <Link href="/auth/(create-account)" asChild>
                <Button
                  variant="utility-light"
                  size={Platform.select({ ios: 'lg', default: 'md' })}>
                  <Text>Create Account</Text>
                </Button>
              </Link>

              <Link href="/auth/(login)" asChild>
                <Button
                  variant="plain-utility-light"
                  size={Platform.select({ ios: 'lg', default: 'md' })}>
                  <Text>Sign In</Text>
                </Button>
              </Link>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </Unauthenticated>
    </>
  );
}
