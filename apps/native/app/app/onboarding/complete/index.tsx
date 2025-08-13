import React from 'react';
import { ImageBackground, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompleteScreen() {
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
              router.replace('/app/home');
            }}>
            <Text>Start Using Motiion</Text>
          </Button>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
