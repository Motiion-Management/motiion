import React from 'react';
import { ImageBackground, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

export default function CompleteScreen() {
  const completeOnboarding = useMutation(api.onboarding.completeOnboarding);
  return (
    <ImageBackground source={require('./background.png')} className="h-full">
      <SafeAreaView className="h-full flex-1">
        <View className="items-between h-full flex-1 px-2 py-8">
          <Text variant="title2" className="mx-6 mb-2 flex-1">
            You're all Set!
          </Text>

          <Button
            size="lg"
            onPress={() => {
              // Fire-and-forget completion so guard won’t redirect back to onboarding
              completeOnboarding({});
              router.replace('/app/home');
            }}>
            <Text>Start Using Motiion</Text>
          </Button>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
