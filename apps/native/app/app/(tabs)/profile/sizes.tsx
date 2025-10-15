import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';

import { Text } from '~/components/ui/text';

export default function SizesScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sizes',
          headerShown: true,
          headerBackTitle: 'Profile',
        }}
      />
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="header4" className="text-text-default">
          Sizes
        </Text>
        <Text variant="body" className="mt-2 text-text-low">
          Body measurements will be displayed here
        </Text>
      </View>
    </>
  );
}
