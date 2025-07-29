import { Stack } from 'expo-router';
import React from 'react';
import { SharedUserProvider } from '~/contexts/SharedUserContext';
import { OnboardingFlowProvider } from '~/contexts/OnboardingFlowContext';

export default function AppLayout() {
  return (
    <SharedUserProvider>
      <OnboardingFlowProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        />
      </OnboardingFlowProvider>
    </SharedUserProvider>
  );
}
