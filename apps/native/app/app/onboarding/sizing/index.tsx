import React from 'react';
import { SizingForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function SizingScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <SizingForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}