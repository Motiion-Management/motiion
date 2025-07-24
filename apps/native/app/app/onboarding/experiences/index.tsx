import React from 'react';
import { View, Text } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
// import { DebugOnboarding } from '~/debug-onboarding';

export default function ExperiencesScreen() {
  const handleContinue = async () => {
    try {
      // TODO: Implement experiences form logic
      console.log('Experiences step - implement form logic');
    } catch (error) {
      console.error('Error in experiences step:', error);
    }
  };

  return (
    <OnboardingStepGuard requiredStep="experiences">
      <BaseOnboardingScreen
        title="Professional Experience"
        description="Tell us about your professional experience."
        canProgress={false} // TODO: Set to true when form is filled
        primaryAction={{
          onPress: handleContinue,
          disabled: true, // TODO: Enable when form is valid
        }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">Experiences form will be implemented here</Text>
          <Text className="mt-2 text-sm text-gray-400">
            This will include professional experience, credits, and work history
          </Text>
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
