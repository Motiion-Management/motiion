import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

export function ProfileVisualsTab() {
  return (
    <View className="flex-1 items-center justify-center px-4">
      <Text variant="body" className="text-center text-text-low">
        Media gallery coming soon
      </Text>
      {/* TODO: Implement media gallery for performance videos and other visual content */}
    </View>
  );
}
