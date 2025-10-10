import { api } from '@packages/backend/convex/_generated/api';
import { Id } from '@packages/backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel';

// export const unstable_settings = {
//   anchor: 'index', // Anchor to the index route
// };

export default function DancerViewLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const profileData = useQuery(
    api.dancers.getDancerProfileWithDetails,
    id ? { dancerId: id as Id<'dancers'> } : 'skip'
  );

  if (profileData === undefined) {
    return null;
  }

  if (profileData === null) {
    return <Redirect href="/app/home" />;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      {/* <Stack.Screen */}
      {/*   name="details" */}
      {/*   options={{ */}
      {/*     presentation: 'formSheet', */}
      {/*     sheetAllowedDetents: [0.25, 0.5], */}
      {/*     sheetGrabberVisible: true, */}
      {/*     headerShown: false, */}
      {/*   }} */}
      {/* /> */}
      <Stack.Screen
        name="projects"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
