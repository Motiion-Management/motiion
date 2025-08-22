import React from 'react';
import { LocationForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function LocationScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <LocationForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}