import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';

import { Text } from '~/components/ui/text';

export default function AboutScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'About',
          headerShown: true,
          headerBackTitle: 'Profile',
        }}
      />
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="header4" className="text-text-default">
          About
        </Text>
        <Text variant="body" className="mt-2 text-text-low">
          Profile information will be displayed here
        </Text>
      </View>
    </>
  );
}
