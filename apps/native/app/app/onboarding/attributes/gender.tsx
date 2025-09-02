import React, { useEffect, useRef, useState } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { GenderForm, type GenderValues } from '~/components/forms/onboarding/GenderForm';
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow';
import { useOnboardingData } from '~/hooks/useOnboardingData';
import { STEP_REGISTRY } from '~/onboarding/registry';
import type { FormHandle } from '~/components/forms/onboarding/contracts';

export default function GenderScreen() {
  const flow = useOnboardingGroupFlow();
  const { data, isLoading } = useOnboardingData();
  const patchUserAttributes = useMutation(api.users.patchUserAttributes);

  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [initialValues, setInitialValues] = useState<GenderValues | null>(null);

  useEffect(() => {
    if (isLoading) return;
    const res = STEP_REGISTRY['gender'].getInitialValues(data);
    Promise.resolve(res).then((vals) => setInitialValues(vals as GenderValues));
  }, [data, isLoading]);

  const handleSubmit = async (values: GenderValues) => {
    await patchUserAttributes({ attributes: { gender: values.gender } });
    flow.navigateToNextStep();
  };

  if (isLoading || !initialValues) return null;

  return (
    <BaseOnboardingScreen
      title="What best describes your gender?"
      description="Select one"
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}>
      <GenderForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
