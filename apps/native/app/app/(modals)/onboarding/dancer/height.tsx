import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { HeightForm } from '~/components/forms/onboarding/HeightForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { HeightValues } from '~/components/forms/onboarding/HeightForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function DancerHeightScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});
  const patchDancerAttributes = useMutation(api.dancers.patchDancerAttributes);

  const handleSubmit = async (values: HeightValues) => {
    try {
      await patchDancerAttributes({ attributes: { height: values.height } });
      // TODO: Navigate to next step in dancer flow (ethnicity)
      // router.push('/onboarding/dancer/ethnicity' as any)
      router.back();
    } catch (error) {
      console.error('Failed to save height:', error);
    }
  };

  if (dancerProfile === undefined) {
    return null; // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Height"
      description="Select your height."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <HeightForm
        ref={formRef}
        initialValues={{
          height: dancerProfile?.attributes?.height || { feet: 5, inches: 0 },
        }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
