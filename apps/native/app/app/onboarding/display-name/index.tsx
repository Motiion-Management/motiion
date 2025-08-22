import React from 'react';
import { DisplayNameForm } from '~/components/forms/onboarding';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';

export default function DisplayNameScreen() {
  const onboarding = useSimpleOnboardingFlow();

  const handleComplete = () => {
    onboarding.navigateNext();
  };

  return (
    <DisplayNameForm
      mode="fullscreen"
      onComplete={handleComplete}
    />
  );
}