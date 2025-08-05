import { Stack, usePathname } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserButton } from '~/components/auth/UserButton';
import { ProgressBar } from '~/components/ui/progress-bar';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

const OnboardingHeaderV1 = () => {
  const stepName = usePathname();
  const cursor = useOnboardingCursor();
  const { getStepLabel } = useOnboardingStatus(stepName);

  return (
    <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <View className="h-8 flex-row items-center bg-transparent px-4">
        <ProgressBar
          currentStep={cursor.currentStepIndex}
          totalSteps={cursor.totalSteps}
          label={getStepLabel(cursor.currentStep || '')}
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
