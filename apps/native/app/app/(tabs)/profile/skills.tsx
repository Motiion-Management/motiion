import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';

import { Text } from '~/components/ui/text';

export default function SkillsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Skills',
          headerShown: true,
          headerBackTitle: 'Profile',
        }}
      />
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="header4" className="text-text-default">
          Skills
        </Text>
        <Text variant="body" className="mt-2 text-text-low">
          Special skills will be displayed here
        </Text>
      </View>
    </>
  );
}
