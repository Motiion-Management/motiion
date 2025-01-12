import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Link, Redirect } from 'expo-router';
import * as React from 'react';
import { Image, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppleButton } from '~/components/auth/AppleButton';
import { GoogleButton } from '~/components/auth/GoogleButton';
import { AlertAnchor } from '~/components/nativewindui/Alert';
import { AlertRef } from '~/components/nativewindui/Alert/types';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';

const LOGO_SOURCE = {
  uri: 'https://nativewindui.com/_next/image?url=/_next/static/media/logo.28276aeb.png&w=2048&q=75',
};

export default function RootScreen() {
  const alertRef = React.useRef<AlertRef>(null);
  return (
    <>
      <SignedIn>
        <Redirect href="/home" />
      </SignedIn>
      <SignedOut>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="ios:justify-end flex-1 justify-center gap-4 px-6 py-4">
            <View className="items-center">
              <Image
                source={LOGO_SOURCE}
                className="ios:h-12 ios:w-12 h-8 w-8"
                resizeMode="contain"
              />
            </View>
            <View className="ios:pb-5 ios:pt-2 pb-2">
              <Text className="ios:font-extrabold text-center text-2xl font-medium">The dance</Text>
              <Text className="ios:font-extrabold text-center text-2xl font-medium">
                ecosystem is in
              </Text>
              <Text className="ios:font-extrabold text-center text-3xl font-medium">motiion</Text>
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
        <AlertAnchor ref={alertRef} />
      </SignedOut>
    </>
  );
}
