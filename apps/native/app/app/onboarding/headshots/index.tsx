import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { MultiImageUpload } from '~/components/upload';
import { trackScreen, perfLog, trackQuery } from '~/utils/performanceDebug';
import { OnboardingScreenWrapper } from '~/components/onboarding/OnboardingScreenWrapper';

export default function HeadshotsScreen() {
  return <OnboardingScreenWrapper v1Component={HeadshotsScreenV1} screenName="headshots" />;
}

function HeadshotsScreenV1() {
  // Track screen mount
  useEffect(() => {
    trackScreen.mountStart('HeadshotsScreen');
    perfLog('screen:Headshots:mounted');
    trackQuery.start('getMyHeadshots');

    return () => {
      trackScreen.mountComplete('HeadshotsScreen');
    };
  }, []);

  const existingHeadshots = useQuery(api.users.headshots.getMyHeadshots);
  const hasImages = (existingHeadshots?.length ?? 0) > 0;

  // Track query completion
  useEffect(() => {
    if (existingHeadshots !== undefined) {
      trackQuery.complete('getMyHeadshots', existingHeadshots?.length || 0);
      perfLog('headshots:queryComplete', {
        count: existingHeadshots?.length || 0,
        hasImages,
      });
    }
  }, [existingHeadshots, hasImages]);

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
