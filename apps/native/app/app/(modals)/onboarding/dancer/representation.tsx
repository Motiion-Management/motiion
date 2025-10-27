import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { RepresentationForm } from '~/components/forms/onboarding/RepresentationForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { RepresentationValues } from '~/components/forms/onboarding/RepresentationForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function DancerRepresentationScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});
  const updateDancerProfile = useMutation(api.dancers.updateMyDancerProfile);

  const handleSubmit = async (values: RepresentationValues) => {
    try {
      await updateDancerProfile({
        representationStatus: values.representationStatus,
      });
      router.back();
    } catch (error) {
      console.error('Failed to save representation status:', error);
    }
  };

  if (dancerProfile === undefined) {
    return null; // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Representation"
      description="Let us know if you have agency representation."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <RepresentationForm
        ref={formRef}
        initialValues={{
          representationStatus: dancerProfile?.representationStatus || 'independent',
        }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
