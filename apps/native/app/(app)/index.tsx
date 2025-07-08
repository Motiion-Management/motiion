import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Redirect } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

export default function AppRouter() {
  const user = useQuery(api.users.getMyUser);
  const { isLoading, isComplete, redirectPath } = useOnboardingStatus();

  // Show loading state while fetching user and onboarding status
  if (user === undefined || isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no user, redirect to auth
  if (user === null) {
    return <Redirect href="/" />;
  }

  // Check onboarding status and redirect appropriately
  if (!isComplete) {
    return <Redirect href={redirectPath} />;
  }

  // User has completed onboarding, go to home
  return <Redirect href="/(app)/home" />;
}
