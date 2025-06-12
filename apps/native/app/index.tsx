import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Link, Redirect } from 'expo-router';
import React from 'react';
import { ImageBackground, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertAnchor } from '~/components/nativewindui/Alert';
import { AlertRef } from '~/components/nativewindui/Alert/types';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';

export default function RootScreen() {
  const alertRef = React.useRef<AlertRef>(null);
  return (
    <>
      <SignedIn>
        <Redirect href="/home" />
      </SignedIn>
      <SignedOut>
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
        <AlertAnchor ref={alertRef} />
      </SignedOut>
    </>
  );
}
