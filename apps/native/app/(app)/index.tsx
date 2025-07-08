import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Redirect } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import { OnboardingCompleteGuard } from '~/components/onboarding/OnboardingGuard';

export default function AppRouter() {
  const user = useQuery(api.users.getMyUser);

  if (user === undefined) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user === null) {
    return <Redirect href="/" />;
  }

  // Use the new OnboardingCompleteGuard to handle routing
  return (
    <OnboardingCompleteGuard>
      <Redirect href="/(app)/home" />
    </OnboardingCompleteGuard>
  );
}
