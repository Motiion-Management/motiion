import React from 'react';
import { View } from 'react-native';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { Text } from '~/components/ui/text';
import { HeaderActionButton } from '~/components/ui/animated-scroll-header';

function ActivityHeaderTitle() {
  return (
    <View className="items-center justify-center">
      <Text variant="header5">Activity</Text>
    </View>
  );
}

export default function ActivityScreen() {
  return (
    <TabScreenLayout
      header={{
        left: ({ scrollProgress }) => (
          <HeaderActionButton
            scrollProgress={scrollProgress}
            iconName="list.dash"
            onPress={() => console.log('Filter list')}
          />
        ),
        middle: <ActivityHeaderTitle />,
        right: ({ scrollProgress }) => (
          <HeaderActionButton
            scrollProgress={scrollProgress}
            iconName="calendar.badge.clock"
            onPress={() => console.log('Schedule')}
          />
        ),
      }}>
      <View className="gap-8 px-4">
        <Text>Activity Screen</Text>
      </View>
    </TabScreenLayout>
  );
}
