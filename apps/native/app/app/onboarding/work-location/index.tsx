import React from 'react';
import { WorkLocationForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function WorkLocationScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <WorkLocationForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}