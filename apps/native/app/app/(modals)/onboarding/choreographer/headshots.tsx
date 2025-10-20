import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { HeadshotsForm } from '~/components/forms/onboarding/HeadshotsForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { HeadshotsValues } from '~/components/forms/onboarding/HeadshotsForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function ChoreographerHeadshotsScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load choreographer profile
  const choreographerProfile = useQuery(api.choreographers.getMyChoreographerProfile, {});

  const handleSubmit = async (values: HeadshotsValues) => {
    try {
      // MultiImageUpload component handles the upload directly
      // No mutation needed here
      router.back();
    } catch (error) {
      console.error('Failed to save headshots:', error);
    }
  };

  if (choreographerProfile === undefined) {
    return null; // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Headshots"
      description="Upload professional headshots to showcase your look."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <HeadshotsForm
        ref={formRef}
        initialValues={{ headshots: choreographerProfile?.headshots }}
        profileQuery={choreographerProfile?.headshots}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
