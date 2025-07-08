import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

export default function EyeColorScreen() {
  const router = useRouter();
  const updateUser = useMutation(api.users.updateMyUser);
  const { getStepTitle } = useOnboardingStatus();

  const handleContinue = async () => {
    try {
      // TODO: Implement eye color form logic
      console.log('Eye color step - implement form logic');

      // For now, just redirect to let the system determine next step
      router.replace('/(app)');
    } catch (error) {
      console.error('Error in eye color step:', error);
    }
  };

  return (
    <OnboardingStepGuard requiredStep="eye-color">
      <BaseOnboardingScreen
        title={getStepTitle()}
        description="What's your eye color?"
        canProgress={false} // TODO: Set to true when form is filled
        primaryAction={{
          onPress: handleContinue,
          disabled: true, // TODO: Enable when form is valid
        }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">Eye color form will be implemented here</Text>
          <Text className="mt-2 text-sm text-gray-400">
            This will include eye color selection options
          </Text>
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
