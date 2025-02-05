import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Link, Redirect } from 'expo-router';
import * as React from 'react';
import { ImageBackground, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppleButton } from '~/components/auth/AppleButton';
import { GoogleButton } from '~/components/auth/GoogleButton';
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
        <ImageBackground source={require('./background.png')} className="h-full">
          <SafeAreaView style={{ flex: 1 }}>
            <View className="mt-[25%] flex w-full items-center">
              <Text variant="largeTitle" color="primary">
                motiion
              </Text>
            </View>
            <View className="ios:justify-end flex-1 justify-center gap-4 px-6 py-4">
              <View className="ios:pb-5 ios:pt-2 pb-2">
                <Text variant="body">
                  By creating an account, you agree to our Terms and Conditions and Privacy Policy.
                </Text>
              </View>
              <Link href="/auth/(create-account)" asChild>
                <Button size={Platform.select({ ios: 'lg', default: 'md' })}>
                  <Text>Sign up free</Text>
                </Button>
              </Link>

              <GoogleButton />
              <AppleButton />
              <Link href="/auth/(login)" asChild>
                <Button variant="plain" size={Platform.select({ ios: 'lg', default: 'md' })}>
                  <Text className="text-primary">Log in</Text>
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
