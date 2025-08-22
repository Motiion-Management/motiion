import React from 'react';
import { HeadshotsForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function HeadshotsScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <HeadshotsForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}