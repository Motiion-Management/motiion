import { Stack } from 'expo-router';
import React from 'react';

export default function DancerViewLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        // header:
      }}>
      <Stack.Screen
        name="index"
        options={{
          // presentation: 'modal',
          headerShown: false,
          // animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="projects"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
