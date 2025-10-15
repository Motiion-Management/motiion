import React from 'react';
import { View } from 'react-native';

import { TabScreenLayout, type TabHeaderSlot } from '~/components/layouts/TabScreenLayout';
import { Text } from '~/components/ui/text';
import { HeaderActionButton } from '~/components/ui/animated-scroll-header';

function ActivityHeaderLeft({ scrollProgress }: TabHeaderSlot) {
  return (
    <HeaderActionButton
      scrollProgress={scrollProgress}
      iconName="list.dash"
      onPress={() => console.log('Filter list')}
    />
  );
}

function ActivityHeaderRight({ scrollProgress }: TabHeaderSlot) {
  return (
    <HeaderActionButton
      scrollProgress={scrollProgress}
      iconName="calendar.badge.clock"
      onPress={() => console.log('Schedule')}
    />
  );
}

export default function ActivityScreen() {
  return (
    <TabScreenLayout
      header={{
        left: ActivityHeaderLeft,
        middle: 'Activity',
        right: ActivityHeaderRight,
      }}>
      <View className="gap-8 px-4">
        <Text>Activity Screen</Text>
      </View>
    </TabScreenLayout>
  );
}
