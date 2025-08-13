import { Stack } from 'expo-router';
import React from 'react';
import { SharedUserProvider } from '~/contexts/SharedUserContext';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';

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
      </BackgroundGradientView>
    </SharedUserProvider>
  );
}
