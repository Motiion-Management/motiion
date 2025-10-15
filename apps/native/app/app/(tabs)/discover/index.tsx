import React from 'react';
import { View } from 'react-native';

import { TabScreenLayout, type TabHeaderSlot } from '~/components/layouts/TabScreenLayout';
import { Text } from '~/components/ui/text';

import { HeaderActionButton } from '~/components/ui/animated-scroll-header';

function DiscoverHeaderLeft({ scrollProgress }: TabHeaderSlot) {
  return (
    <HeaderActionButton
      scrollProgress={scrollProgress}
      iconName="bookmark"
      onPress={() => console.log('Saved')}
    />
  );
}

function DiscoverHeaderRight({ scrollProgress }: TabHeaderSlot) {
  return (
    <HeaderActionButton
      scrollProgress={scrollProgress}
      iconName="magnifyingglass"
      onPress={() => console.log('Search')}
    />
  );
}

export default function DiscoverScreen() {
  return (
    <TabScreenLayout
      header={{
        left: DiscoverHeaderLeft,
        middle: 'Discover',
        right: DiscoverHeaderRight,
      }}>
      <View className="gap-8 px-4">
        <Text>Discover Screen</Text>
      </View>
    </TabScreenLayout>
  );
}
