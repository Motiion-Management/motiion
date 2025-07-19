import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingNavigation, useOnboardingStatus } from '~/hooks/useOnboardingStatus';

export default function SkillsScreen() {
  const router = useRouter();
  const { getStepTitle } = useOnboardingStatus();
  const { advanceToNextStep } = useOnboardingNavigation();

  const handleContinue = async () => {
    try {
      // TODO: Implement skills form logic
      console.log('Skills step - implement form logic');

      // Navigate to the next step
      const result = await advanceToNextStep();
      if (result.route) {
        router.push(result.route);
      } else {
        // If no next step, onboarding is complete
        router.push('/app/home');
      }
    } catch (error) {
      console.error('Error in skills step:', error);
    }
  };

  return (
    <OnboardingStepGuard requiredStep="skills">
      <BaseOnboardingScreen
        title={getStepTitle()}
        description="What are your skills and abilities?"
        canProgress={false} // TODO: Set to true when form is filled
        primaryAction={{
          onPress: handleContinue,
          disabled: true, // TODO: Enable when form is valid
        }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">Skills form will be implemented here</Text>
          <Text className="mt-2 text-sm text-gray-400">
            This will include skills, abilities, and expertise levels
          </Text>
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
