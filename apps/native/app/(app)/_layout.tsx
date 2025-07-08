import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Stack, Redirect } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function AppLayout() {
  const user = useQuery(api.users.getMyUser);

  if (user === undefined) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user === null) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
