import { Href, Redirect } from 'expo-router';
import React, { useMemo, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { AuthErrorBoundary } from '~/components/auth/AuthErrorBoundary';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

export default function AppRouter() {
  const { isLoading, isComplete, redirectPath } = useOnboardingStatus();

  console.log('🔄 APP_ROUTER: Onboarding status check', {
    isLoading,
    isComplete,
    redirectPath,
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

  // Determine where to redirect based on onboarding status
  const destination: Href = isComplete 
    ? '/(app)/home' 
    : (redirectPath || '/(app)/onboarding/profile-type');

  console.log('🎯 APP_ROUTER: Redirecting to:', destination);

  return (
    <AuthErrorBoundary>
      <Redirect href={destination} />
    </AuthErrorBoundary>
  );
}
