import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

export default function LocationScreen() {
  const router = useRouter();
  const updateUser = useMutation(api.users.updateMyUser);
  const { getStepTitle, getNextStepRoute } = useOnboardingStatus();

  const handleContinue = async () => {
    try {
      // TODO: Implement location form logic
      console.log('Location step - implement form logic');

      // Navigate to the next step
      const nextRoute = getNextStepRoute();
      if (nextRoute) {
        router.push(nextRoute);
      } else {
        router.push('/app');
      }
    } catch (error) {
      console.error('Error in location step:', error);
    }
  };

  return (
    <OnboardingStepGuard requiredStep="location">
      <BaseOnboardingScreen
        title={getStepTitle()}
        description="Where are you located and willing to work?"
        canProgress={false} // TODO: Set to true when form is filled
        primaryAction={{
          onPress: handleContinue,
          disabled: true, // TODO: Enable when form is valid
        }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">Location form will be implemented here</Text>
          <Text className="mt-2 text-sm text-gray-400">
            This will include current location, work areas, and travel preferences
          </Text>
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
