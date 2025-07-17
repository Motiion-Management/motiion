import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { MultiImageUpload } from '~/components/upload';
import { useOnboardingStatus, useOnboardingNavigation } from '~/hooks/useOnboardingStatus';

export default function HeadshotsScreen() {
  const router = useRouter();
  const { getStepTitle } = useOnboardingStatus();
  const { advanceToNextStep } = useOnboardingNavigation();
  const existingHeadshots = useQuery(api.users.headshots.getMyHeadshots);
  const hasImages = (existingHeadshots?.length ?? 0) > 0;

  const handleContinue = async () => {
    try {
      // Advance to the next step using the backend logic
      const result = await advanceToNextStep();
      if (result.route) {
        router.push(result.route);
      } else {
        // If no next step, onboarding is complete
        router.push('/app/home');
      }
    } catch (error) {
      console.error('Error advancing onboarding step:', error);
    }
  };

  return (
    <OnboardingStepGuard requiredStep="headshots">
      <BaseOnboardingScreen
        title={getStepTitle()}
        description="Upload your professional headshots to showcase your look."
        canProgress={hasImages}
        primaryAction={{
          onPress: handleContinue,
        }}>
        <View className="mt-4 flex-1">
          <MultiImageUpload />
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
