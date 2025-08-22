import React from 'react';
import { EthnicityForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function EthnicityScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <EthnicityForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}