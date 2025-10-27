import { Stack } from 'expo-router';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';

export default function DiscoverLayout() {
  return (
    <BackgroundGradientView>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}>
        <Stack.Screen
          name="index"
          options={{
            title: 'Discover',
          }}
        />
      </Stack>
    </BackgroundGradientView>
  );
}
