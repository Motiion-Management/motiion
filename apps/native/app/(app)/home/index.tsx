import { useAuth } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import * as React from 'react';
import { Image, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingCompleteGuard } from '~/components/onboarding/OnboardingGuard';
import { AlertAnchor } from '~/components/ui/alert';
import { AlertRef } from '~/components/ui/alert/types';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

const LOGO_SOURCE = {
  uri: 'https://nativewindui.com/_next/image?url=/_next/static/media/logo.28276aeb.png&w=2048&q=75',
};

const GOOGLE_SOURCE = {
  uri: 'https://www.pngall.com/wp-content/uploads/13/Google-Logo.png',
};

export default function AuthIndexScreen() {
  const { signOut } = useAuth();
  const alertRef = React.useRef<AlertRef>(null);

  return (
    <OnboardingCompleteGuard>
      <SafeAreaView style={{ flex: 1 }}>
        <View className="ios:justify-end flex-1 justify-center gap-4 px-8 py-4">
          <View className="items-center">
            <Image
              source={LOGO_SOURCE}
              className="ios:h-12 ios:w-12 h-8 w-8"
              resizeMode="contain"
            />
          </View>
          <View className="ios:pb-5 ios:pt-2 pb-2">
            <Text className="ios:font-extrabold text-center text-3xl font-medium">
              Brace Yourself
            </Text>
            <Text className="ios:font-extrabold text-center text-3xl font-medium">
              for What's Next
            </Text>
          </View>
          <Button variant="destructive" onPress={() => signOut()} className="mx-8">
            <Text>Sign Out</Text>
          </Button>
        </View>
      </SafeAreaView>
      <AlertAnchor ref={alertRef} />
    </OnboardingCompleteGuard>
  );
}
