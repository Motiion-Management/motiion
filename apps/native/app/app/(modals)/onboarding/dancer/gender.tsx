import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { GenderForm } from '~/components/forms/onboarding/GenderForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { GenderValues } from '~/components/forms/onboarding/GenderForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function DancerGenderScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});
  const patchDancerAttributes = useMutation(api.dancers.patchDancerAttributes);

  const handleSubmit = async (values: GenderValues) => {
    try {
      await patchDancerAttributes({ attributes: { gender: values.gender } });
      // TODO: Navigate to next step in dancer flow
      router.back();
    } catch (error) {
      console.error('Failed to save gender:', error);
    }
  };

  if (dancerProfile === undefined) {
    return null; // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Gender"
      description="Select the option that best describes you."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <GenderForm
        ref={formRef}
        initialValues={{
          gender: dancerProfile?.attributes?.gender || 'Male',
        }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
