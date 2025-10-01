import { Stack } from 'expo-router';
import React from 'react';
import { SharedUserProvider } from '~/contexts/SharedUserContext';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import DevOnboardingTools from '~/components/dev/DevOnboardingTools';

export default function AppLayout() {
  return (
    <SharedUserProvider>
      <BackgroundGradientView>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}>
          <Stack.Screen
            name="(modals)"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        {/* Dev-only floating tools for onboarding iteration */}
        {/* <DevOnboardingTools /> */}
      </BackgroundGradientView>
    </SharedUserProvider>
  );
}
