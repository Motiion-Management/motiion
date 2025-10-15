import React from 'react';
import { View } from 'react-native';

import { TabScreenLayout, type TabHeaderSlot } from '~/components/layouts/TabScreenLayout';
import { HeaderActionButton } from '~/components/ui/animated-scroll-header';
import { Text } from '~/components/ui/text';

function SettingsHeaderRight({ scrollProgress }: TabHeaderSlot) {
  return (
    <HeaderActionButton
      scrollProgress={scrollProgress}
      iconName="rectangle.portrait.and.arrow.right"
      iconSize={20}
      onPress={() => console.log('Logout')}
    />
  );
}

export default function SettingsScreen() {
  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Settings',
        right: SettingsHeaderRight,
      }}>
      <View className="gap-8 px-4">
        <Text>Settings Screen</Text>
      </View>
    </TabScreenLayout>
  );
}
