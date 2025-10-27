import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { SizingForm } from '~/components/forms/onboarding/SizingForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { SizingValues } from '~/components/forms/onboarding/SizingForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function DancerSizingScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});

  const handleSubmit = async (values: SizingValues) => {
    try {
      // SizingSection components handle their own persistence
      // No mutation needed here
      router.back();
    } catch (error) {
      console.error('Failed to save sizing:', error);
    }
  };

  if (dancerProfile === undefined) {
    return null; // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Sizing"
      description="Enter your clothing measurements for casting."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <SizingForm
        ref={formRef}
        initialValues={{}}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
