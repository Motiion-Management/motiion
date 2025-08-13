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
          }}
        />
        {/* Dev-only floating tools for onboarding iteration */}
        <DevOnboardingTools />
      </BackgroundGradientView>
    </SharedUserProvider>
  );
}
