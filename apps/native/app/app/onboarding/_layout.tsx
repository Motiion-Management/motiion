import { Stack, usePathname } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserButton } from '~/components/auth/UserButton';
import { GroupProgressBar } from '~/components/onboarding/GroupProgressBar';

const OnboardingHeader = () => {
  const pathname = usePathname();

  // Hide the onboarding header on the complete screen
  if (pathname && pathname.includes('/onboarding/complete')) {
    return null;
  }

  return (
    <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <View className="h-8 flex-row items-center bg-transparent px-4">
        <GroupProgressBar />
        <UserButton />
      </View>
    </SafeAreaView>
  );
};

export default function OnboardingLayout() {
  return (
    <View className="flex-1">
      <OnboardingHeader />
      <Stack
        screenOptions={{
          headerShown: false,
          title: 'Profile Setup',
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'default',
          gestureEnabled: true,
        }}
      />
    </View>
  );
}
