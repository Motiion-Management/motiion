import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { bottom } = useSafeAreaInsets();

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
      }}
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: bottom + 120,
      }}
      showsVerticalScrollIndicator={false}>
      <View className="gap-8">
        <Text>Discover Screen</Text>
      </View>
    </TabScreenLayout>
  );
}
