import React, { useRef, useState } from 'react';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { SizingForm } from '~/components/forms/onboarding/SizingForm';
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow';
import type { FormHandle } from '~/components/forms/onboarding/contracts';

export default function SizingScreen() {
  const flow = useOnboardingGroupFlow();
  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(true);

  const handleSubmit = async () => {
    flow.navigateToNextStep();
  };

  return (
    <BaseOnboardingScreen
      title="Size Card"
      description="Optional - Not all sizing metrics may apply to you. Only input what is relevant to you."
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}>
      <SizingForm ref={formRef} initialValues={{}} onSubmit={handleSubmit} />
    </BaseOnboardingScreen>
  );
}
