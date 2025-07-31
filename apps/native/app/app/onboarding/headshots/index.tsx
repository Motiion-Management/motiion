import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { MultiImageUpload } from '~/components/upload';
import { trackScreen, perfLog, trackQuery } from '~/utils/performanceDebug';
import { useHybridOnboarding } from '~/hooks/useHybridOnboarding';

export default function HeadshotsScreen() {
  const hybrid = useHybridOnboarding();

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

  // Handle image count changes for auto-navigation
  const handleImageCountChange = (count: number) => {
    if (hybrid.isV3Enabled && hybrid.shouldAutoSubmit() && count > 0) {
      // Auto-navigate after a delay when images are uploaded
      setTimeout(() => {
        hybrid.navigateNext();
      }, hybrid.getSubmitDelay());
    }
  };

  // For V3, handle manual navigation
  const handleContinue = () => {
    if (hybrid.isV3Enabled && hasImages) {
      hybrid.navigateNext();
    }
  };

  // Use V3 step info if available
  const title = hybrid.currentStep?.title || "Headshots";
  const description = hybrid.currentStep?.description || "Upload your professional headshots to showcase your look.";

  return (
    <OnboardingStepGuard requiredStep="headshots">
      <BaseOnboardingScreen
        title={title}
        description={description}
        canProgress={hasImages}
        primaryAction={hybrid.isV3Enabled ? {
          onPress: handleContinue,
          handlesNavigation: true,
        } : undefined}>
        <View className="mt-4 flex-1">
          <MultiImageUpload onImageCountChange={handleImageCountChange} />
        </View>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}