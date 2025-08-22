import React from 'react';
import { GenderForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function GenderScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <GenderForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}