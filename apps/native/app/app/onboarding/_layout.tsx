import { Stack, usePathname } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserButton } from '~/components/auth/UserButton';
import { ProgressBar } from '~/components/ui/progress-bar';
import { useOnboardingGroupFlow, ONBOARDING_GROUPS } from '~/hooks/useOnboardingGroupFlow';
import { useUser } from '~/hooks/useUser';

const OnboardingHeaderV1 = () => {
  const stepName = usePathname();
  const flow = useOnboardingGroupFlow();
  const { user } = useUser();

  // Hide the onboarding header on the complete screen
  if (stepName && stepName.includes('/onboarding/complete')) {
    return null;
  }

  // Use group-based labels from the flow
  const label = flow.currentGroup
    ? ONBOARDING_GROUPS[flow.currentGroup]?.label || 'PROFILE'
    : 'PROFILE';

  return (
    <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <View className="h-8 flex-row items-center bg-transparent px-4">
        <ProgressBar
          currentStep={flow.currentStepInGroup}
          totalSteps={flow.totalStepsInGroup}
          label={label}
        />
        <UserButton />
      </View>
    </SafeAreaView>
  );
};

export default function OnboardingLayout() {
  return (
    <View className="flex-1">
      <OnboardingHeaderV1 />
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
