import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TabScreenHeaderActionButton,
  TabScreenLayout,
} from '~/components/layouts/TabScreenLayout';
import { Text } from '~/components/ui/text';

export default function SettingsScreen() {
  const { bottom } = useSafeAreaInsets();

  return (
    <TabScreenLayout
      header={{
        left: ({ scrollProgress }) => (
          <TabScreenHeaderActionButton
            scrollProgress={scrollProgress}
            iconName="xmark"
            iconSize={20}
            onPress={() => router.back()}
          />
        ),
        right: ({ scrollProgress }) => (
          <TabScreenHeaderActionButton
            scrollProgress={scrollProgress}
            iconName="ellipsis"
            iconSize={20}
            onPress={() => console.log('More options')}
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
