import { Stack, usePathname, useGlobalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserButton } from '~/components/auth/UserButton';
import { ProgressBar } from '~/components/ui/progress-bar';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';
import { useOnboardingFlowV3 } from '~/hooks/useOnboardingFlowV3';

/**
 * Hook to check if V3 onboarding is enabled
 */
export function useIsV3Onboarding() {
  const params = useGlobalSearchParams();
  return params.v3 === 'true' || process.env.EXPO_PUBLIC_USE_V3_ONBOARDING === 'true';
}

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

const OnboardingHeaderV3 = () => {
  const { currentIndex, totalSteps, currentStep } = useOnboardingFlowV3();

  return (
    <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
      <View className="h-8 flex-row items-center bg-transparent px-4">
        <ProgressBar
          currentStep={currentIndex}
          totalSteps={totalSteps}
          label={currentStep?.name || ''}
        />
        <UserButton />
      </View>
    </SafeAreaView>
  );
};

export default function OnboardingLayout() {
  const useV3 = useIsV3Onboarding();

  React.useEffect(() => {
    console.log('[OnboardingLayout] Using', useV3 ? 'V3' : 'V1', 'onboarding flow');
  }, [useV3]);

  return (
    <View className="flex-1">
      <OnboardingHeaderV3 />
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
