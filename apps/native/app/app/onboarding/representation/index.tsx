import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

export default function RepresentationScreen() {
  const router = useRouter();
  const updateUser = useMutation(api.users.updateMyUser);
  const { getStepTitle, getNextStepRoute } = useOnboardingStatus();

  const handleContinue = async () => {
    try {
      // TODO: Implement representation form logic
      console.log('Representation step - implement form logic');

      // Navigate to the next step
      const nextRoute = getNextStepRoute();
      if (nextRoute) {
        router.push(nextRoute);
      } else {
        router.push('/app');
      }
    } catch (error) {
      console.error('Error in representation step:', error);
    }
  };

  return (
    <OnboardingStepGuard requiredStep="representation">
      <BaseOnboardingScreen
        title={getStepTitle()}
        description="Tell us about your agency and representation."
        canProgress={false} // TODO: Set to true when form is filled
        primaryAction={{
          onPress: handleContinue,
          disabled: true, // TODO: Enable when form is valid
        }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">
            Representation form will be implemented here
          </Text>
          <Text className="mt-2 text-sm text-gray-400">
            This will include agency information, contact details, and representation preferences
          </Text>
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
