import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { MultiImageUpload } from '~/components/upload';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

export default function HeadshotsScreen() {
  const router = useRouter();
  const { getStepTitle } = useOnboardingStatus();
  const existingHeadshots = useQuery(api.users.headshots.getMyHeadshots);
  const hasImages = (existingHeadshots?.length ?? 0) > 0;

  const handleContinue = async () => {
    try {
      // Navigate to next step since images are already saved to backend
      router.replace('/(app)');
    } catch (error) {
      console.error('Error in headshots step:', error);
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
