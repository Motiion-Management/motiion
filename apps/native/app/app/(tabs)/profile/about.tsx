import React from 'react';
import { View } from 'react-native';

import { Text } from '~/components/ui/text';
import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';

export default function AboutScreen() {
  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'About',
      }}>
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="header4" className="text-text-default">
          About
        </Text>
        <Text variant="body" className="mt-2 text-text-low">
          Profile information will be displayed here
        </Text>
      </View>
    </TabScreenLayout>
  );
}
