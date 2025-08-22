import React from 'react';
import { EyeColorForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function EyeColorScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <EyeColorForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}