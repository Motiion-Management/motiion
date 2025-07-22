import React from 'react';
import { View, Text } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';

export default function CompanyScreen() {
  const handleContinue = async () => {
    try {
      // TODO: Implement company form logic
      console.log('Company step - implement form logic');
    } catch (error) {
      console.error('Error in company step:', error);
    }
  };

  return (
    <OnboardingStepGuard requiredStep="company">
      <BaseOnboardingScreen
        title="Company Information"
        description="Tell us about your company or organization."
        canProgress={false} // TODO: Set to true when form is filled
        primaryAction={{
          onPress: handleContinue,
          disabled: true, // TODO: Enable when form is valid
        }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">
            Company information form will be implemented here
          </Text>
          <Text className="mt-2 text-sm text-gray-400">
            This will include company name, role, and database usage details
          </Text>
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
