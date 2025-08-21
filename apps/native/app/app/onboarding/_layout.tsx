import { Stack, usePathname } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserButton } from '~/components/auth/UserButton';
import { ProgressBar } from '~/components/ui/progress-bar';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';
import { useUser } from '~/hooks/useUser';

const OnboardingHeaderV1 = () => {
  const stepName = usePathname();
  const flow = useSimpleOnboardingFlow();
  const { user } = useUser();

  // Hide the onboarding header on the complete screen
  if (stepName && stepName.includes('/onboarding/complete')) {
    return null;
  }

  // Use section-based labels from the flow
  const label = flow.currentSectionLabel;

  return (
    <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <View className="h-8 flex-row items-center bg-transparent px-4">
        <ProgressBar currentStep={flow.currentIndex} totalSteps={flow.totalSteps} label={label} />
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
