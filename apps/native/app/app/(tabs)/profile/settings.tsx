import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { HeaderActionButton } from '~/components/ui/animated-scroll-header';
import { Text } from '~/components/ui/text';

export default function SettingsScreen() {
  const { bottom } = useSafeAreaInsets();

  return (
    <TabScreenLayout
      header={{
        left: ({ scrollProgress }) => (
          <HeaderActionButton
            scrollProgress={scrollProgress}
            iconName="chevron.left"
            iconSize={20}
            onPress={() => router.back()}
          />
        ),
        middle: () => (
          <View className="items-center justify-center">
            <Text variant="header5">Settings</Text>
          </View>
        ),
        right: ({ scrollProgress }) => (
          <HeaderActionButton
            scrollProgress={scrollProgress}
            iconName="rectangle.portrait.and.arrow.right"
            iconSize={20}
            onPress={() => console.log('Logout')}
          />
        ),
      }}
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: bottom + 120,
      }}
      showsVerticalScrollIndicator={false}>
      <View className="gap-8">
        <Text>Settings Screen</Text>
      </View>
    </TabScreenLayout>
  );
}
