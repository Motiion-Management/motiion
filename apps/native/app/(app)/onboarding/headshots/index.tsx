import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { MultiImageUpload } from '~/components/upload';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

export default function HeadshotsScreen() {
  const router = useRouter();
  const { getStepTitle, getNextStepRoute } = useOnboardingStatus();
  const existingHeadshots = useQuery(api.users.headshots.getMyHeadshots);
  const hasImages = (existingHeadshots?.length ?? 0) > 0;
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleContinue = async () => {
    try {
      // Get the next step route from the onboarding system
      const nextRoute = getNextStepRoute();
      if (nextRoute) {
        router.push(nextRoute);
      } else {
        // If no next step, onboarding is complete
        router.push('/(app)/home');
      }
    } catch (error) {
      console.error('Error in headshots step:', error);
    }
  };

  const handleImageCountChange = (count: number) => {
    if (count > 0) {
      setHasInteracted(true);
    }
  };

  return (
    <OnboardingStepGuard requiredStep="headshots">
      <BaseOnboardingScreen
        title={getStepTitle()}
        description="Upload your professional headshots to showcase your look."
        canProgress={hasImages && hasInteracted}
        primaryAction={{
          onPress: handleContinue,
        }}>
        <View className="mt-4 flex-1">
          <MultiImageUpload onImageCountChange={handleImageCountChange} />
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
