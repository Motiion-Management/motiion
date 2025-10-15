import { Stack } from 'expo-router';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';

export default function ProfileLayout() {
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
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
      </Stack>
    </BackgroundGradientView>
  );
}
