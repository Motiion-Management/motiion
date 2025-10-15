import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { HeaderActionButton } from '~/components/ui/animated-scroll-header';
import { Text } from '~/components/ui/text';

export default function SettingsScreen() {
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
      }}>
      <View className="gap-8 px-4">
        <Text>Settings Screen</Text>
      </View>
    </TabScreenLayout>
  );
}
