import React, { useEffect, useRef, useState } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { HeightForm, type HeightValues } from '~/components/forms/onboarding/HeightForm';
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow';
import { useOnboardingData } from '~/hooks/useOnboardingData';
import { STEP_REGISTRY } from '~/onboarding/registry';
import type { FormHandle } from '~/components/forms/onboarding/contracts';

export default function HeightScreen() {
  const flow = useOnboardingGroupFlow();
  const { data, isLoading } = useOnboardingData();
  const patchUserAttributes = useMutation(api.users.patchUserAttributes);

  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [initialValues, setInitialValues] = useState<HeightValues | null>(null);

  useEffect(() => {
    if (isLoading) return;
    const res = STEP_REGISTRY['height'].getInitialValues(data);
    Promise.resolve(res).then((vals) => setInitialValues(vals as HeightValues));
  }, [data, isLoading]);

  const handleSubmit = async (values: HeightValues) => {
    await patchUserAttributes({ attributes: { height: values.height } });
    flow.navigateToNextStep();
  };

  if (isLoading || !initialValues) return null;

  return (
    <BaseOnboardingScreen
      title="How tall are you?"
      description="Select height"
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}>
      <HeightForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
