import React from 'react';
import { HairColorForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function HairColorScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <HairColorForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}