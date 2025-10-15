import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
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
  const { bottom } = useSafeAreaInsets();

  return (
    <BackgroundGradientView>
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
        }}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: bottom + 120,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="gap-8">
          <Text>Activity Screen</Text>
        </View>
      </TabScreenLayout>
    </BackgroundGradientView>
  );
}
