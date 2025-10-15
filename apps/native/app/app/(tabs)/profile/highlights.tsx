import React from 'react';
import { View } from 'react-native';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { Text } from '~/components/ui/text';

export default function HighlightsScreen() {
  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Highlights',
      }}>
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="header4" className="text-text-default">
          Highlights
        </Text>
        <Text variant="body" className="mt-2 text-text-low">
          Career highlights will be displayed here
        </Text>
      </View>
    </TabScreenLayout>
  );
}
