import { Stack, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '~/components/ui/progress-bar';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatusNew';

export default function OnboardingLayout() {
  const navigation = useNavigation();
  const { currentStepIndex, totalSteps, getStepLabel, isLoading } = useOnboardingStatus();
  const stepLabel = getStepLabel();

  // Update header when progress changes
  useEffect(() => {
    if (isLoading) return;

    navigation.setOptions({
      headerShown: true,
      title: 'Profile Setup',
      header: () => {
        return (
          <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <View className="h-8 flex-row items-center bg-transparent pl-4 pr-0">
              <ProgressBar
                currentStep={currentStepIndex}
                totalSteps={totalSteps}
                label={stepLabel}
              />
            </View>
          </SafeAreaView>
        );
      },
    });
  }, [navigation, currentStepIndex, totalSteps, stepLabel, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
      }}
    />
  );
}
