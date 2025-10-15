import React from 'react';
import { View } from 'react-native';

import { TabScreenLayout } from '~/components/layouts/TabScreenLayout';
import { Text } from '~/components/ui/text';

export default function AgentScreen() {
  return (
    <TabScreenLayout
      header={{
        left: 'back',
        middle: 'Agent',
      }}>
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="header4" className="text-text-default">
          Agent
        </Text>
        <Text variant="body" className="mt-2 text-text-low">
          Agent and representation information will be displayed here
        </Text>
      </View>
    </TabScreenLayout>
  );
}
