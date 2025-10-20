import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { DisplayNameForm } from '~/components/forms/onboarding/DisplayNameForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { DisplayNameValues } from '~/components/forms/onboarding/DisplayNameForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function DancerDisplayNameScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load dancer profile
  const dancerProfile = useQuery(api.dancers.getMyDancerProfile, {});
  const updateDancerProfile = useMutation(api.dancers.updateMyDancerProfile);

  const handleSubmit = async (values: DisplayNameValues) => {
    try {
      await updateDancerProfile({ displayName: values.displayName.trim() });
      // TODO: Navigate to next step in dancer flow (height)
      // router.push('/onboarding/dancer/height' as any)
      router.back();
    } catch (error) {
      console.error('Failed to save display name:', error);
    }
  };

  if (dancerProfile === undefined) {
    return null; // Loading state
  }

  return (
    <BaseOnboardingScreen
      title="Display name"
      description="Choose how your name appears."
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <DisplayNameForm
        ref={formRef}
        initialValues={{
          displayName: (dancerProfile?.displayName as string | undefined) || '',
        }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
