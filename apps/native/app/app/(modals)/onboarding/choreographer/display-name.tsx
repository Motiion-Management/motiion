import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { DisplayNameForm } from '~/components/forms/onboarding/DisplayNameForm';
import type { FormHandle } from '~/components/forms/onboarding/contracts';
import type { DisplayNameValues } from '~/components/forms/onboarding/DisplayNameForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

export default function ChoreographerDisplayNameScreen() {
  const router = useRouter();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  // Load choreographer profile
  const choreographerProfile = useQuery(api.choreographers.getMyChoreographerProfile, {});
  const updateChoreographerProfile = useMutation(api.choreographers.updateMyChoreographerProfile);

  const handleSubmit = async (values: DisplayNameValues) => {
    try {
      await updateChoreographerProfile({ displayName: values.displayName.trim() });
      // TODO: Navigate to next step in choreographer flow (location)
      // router.push('/onboarding/choreographer/location' as any)
      router.back();
    } catch (error) {
      console.error('Failed to save display name:', error);
    }
  };

  if (choreographerProfile === undefined) {
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
          displayName: (choreographerProfile?.displayName as string | undefined) || '',
        }}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
