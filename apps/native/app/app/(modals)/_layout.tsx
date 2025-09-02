import { Stack } from 'expo-router';
import React from 'react';

export default function ModalGroupLayout() {
  return (
    <Stack
      screenOptions={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
    />
  );
}
