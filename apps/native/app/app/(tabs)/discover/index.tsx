import React from 'react';
import { View } from 'react-native';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { Text } from '~/components/ui/text';

import { HeaderActionButton } from '~/components/ui/animated-scroll-header';

function DiscoverHeaderTitle() {
  return (
    <View className="items-center justify-center">
      <Text variant="header5">Discover</Text>
    </View>
  );
}

export default function DiscoverScreen() {
  return (
    <TabScreenLayout
      header={{
        left: ({ scrollProgress }) => (
          <HeaderActionButton
            scrollProgress={scrollProgress}
            iconName="bookmark"
            onPress={() => console.log('Saved')}
          />
        ),
        middle: <DiscoverHeaderTitle />,
        right: ({ scrollProgress }) => (
          <HeaderActionButton
            scrollProgress={scrollProgress}
            iconName="magnifyingglass"
            onPress={() => console.log('Search')}
          />
        ),
      }}>
      <View className="gap-8 px-4">
        <Text>Discover Screen</Text>
      </View>
    </TabScreenLayout>
  );
}
