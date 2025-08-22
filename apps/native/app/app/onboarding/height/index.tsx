import React from 'react';
import { HeightForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function HeightScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <HeightForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}