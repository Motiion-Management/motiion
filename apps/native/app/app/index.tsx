import { Href, Redirect, useSegments } from 'expo-router';
import React, { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { AuthErrorBoundary } from '~/components/auth/AuthErrorBoundary';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

export default function AppRouter() {
  const { isLoading, isComplete, redirectPath } = useOnboardingStatus();
  const segments = useSegments();

  // Check if we're already on an onboarding screen
  const isOnOnboardingScreen = useMemo(() => {
    return segments.length >= 2 && segments[1] === 'onboarding';
  }, [segments]);

  console.log('🔄 APP_ROUTER: Onboarding status check', {
    isLoading,
    isComplete,
    redirectPath,
    currentSegments: segments,
    isOnOnboardingScreen,
  });

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <BackgroundGradientView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </BackgroundGradientView>
    );
  }

  // If already on an onboarding screen, don't redirect (avoid loops)
  if (isOnOnboardingScreen && !isComplete) {
    console.log('🚫 APP_ROUTER: Already on onboarding screen, skipping redirect');
    // Return empty view instead of null to avoid placeholder screen issues
    return <View style={{ flex: 1 }} />;
  }

  // Determine where to redirect based on onboarding status
  const destination: Href = isComplete
    ? '/app/home'
    : redirectPath || '/app/onboarding/profile-type';

  console.log('🎯 APP_ROUTER: Redirecting to:', destination);

  return (
    <AuthErrorBoundary>
      <Redirect href={destination} />
    </AuthErrorBoundary>
  );
}
