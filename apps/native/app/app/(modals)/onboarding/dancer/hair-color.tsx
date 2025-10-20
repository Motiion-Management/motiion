import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { HairColorForm } from '~/components/forms/onboarding/HairColorForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { HairColorValues } from '~/components/forms/onboarding/HairColorForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function DancerHairColorScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});
  const patchDancerAttributes = useMutation(api.dancers.patchDancerAttributes);

  const handleSubmit = async (values: HairColorValues) => {
    try {
      await patchDancerAttributes({ attributes: { hairColor: values.hairColor } });
      // TODO: Navigate to next step in dancer flow (eye color)
      // router.push('/onboarding/dancer/eye-color' as any)
      router.back();
    } catch (error) {
      console.error('Failed to save hair color:', error);
    }
  };

  if (dancerProfile === undefined) {
    return null; // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Hair color"
      description="Select your current hair color."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <HairColorForm
        ref={formRef}
        initialValues={{
          hairColor: dancerProfile?.attributes?.hairColor || 'Brown',
        }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
