import { Stack } from 'expo-router'
import React from 'react'

export default function ProfileGroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    />
  )
}