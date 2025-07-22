import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import React from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { MultiImageUpload } from '~/components/upload';

export default function HeadshotsScreen() {
  const existingHeadshots = useQuery(api.users.headshots.getMyHeadshots);
  const hasImages = (existingHeadshots?.length ?? 0) > 0;

  return (
    <OnboardingStepGuard requiredStep="headshots">
      <BaseOnboardingScreen
        title="Headshots"
        description="Upload your professional headshots to showcase your look."
        canProgress={hasImages}>
        <View className="mt-4 flex-1">
          <MultiImageUpload />
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
