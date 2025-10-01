import { Href, Redirect, useSegments } from 'expo-router';
import React, { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { AuthErrorBoundary } from '~/components/auth/AuthErrorBoundary';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

export default function AppRouter() {
  const redirectInfo = useQuery(api.onboarding.getOnboardingRedirect);
  const segments = useSegments();

  // Check if we're already on an onboarding screen
  const isOnOnboardingScreen = useMemo(() => {
    // Check for onboarding in any position in segments array
    return segments.some((segment) => segment === 'onboarding');
  }, [segments]);

  // Debug logging removed for cleaner output

  // Show loading state while checking onboarding status
  if (redirectInfo === undefined) {
    return (
      <BackgroundGradientView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </BackgroundGradientView>
    );
  }

  // If already on an onboarding screen, don't redirect (avoid loops)
  if (isOnOnboardingScreen && redirectInfo.shouldRedirect) {
    // Return empty view instead of null to avoid placeholder screen issues
    return <View style={{ flex: 1 }} />;
  }

  // Determine where to redirect based on onboarding status
  const destination: Href = redirectInfo.shouldRedirect
    ? (redirectInfo.redirectPath as Href)
    : ('/app/home' as Href);

  // Redirect to appropriate screen

  return (
    <AuthErrorBoundary>
      <Redirect href={destination} />
    </AuthErrorBoundary>
  );
}
