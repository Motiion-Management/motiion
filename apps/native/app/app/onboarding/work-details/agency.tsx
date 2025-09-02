import React, { useEffect, useRef, useState } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { AgencyForm, type AgencyValues } from '~/components/forms/onboarding/AgencyForm';
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow';
import { useOnboardingData } from '~/hooks/useOnboardingData';
import { STEP_REGISTRY } from '~/onboarding/registry';
import type { FormHandle } from '~/components/forms/onboarding/contracts';

export default function AgencyScreen() {
  const flow = useOnboardingGroupFlow();
  const { data, isLoading } = useOnboardingData();
  const addMyRepresentation = useMutation(api.users.representation.addMyRepresentation);

  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [initialValues, setInitialValues] = useState<AgencyValues | null>(null);

  useEffect(() => {
    if (isLoading) return;
    const res = STEP_REGISTRY['agency'].getInitialValues(data);
    Promise.resolve(res).then((vals) => setInitialValues(vals as AgencyValues));
  }, [data, isLoading]);

  const handleSubmit = async (values: AgencyValues) => {
    if (values.agencyId) {
      await addMyRepresentation({ agencyId: values.agencyId as any });
    }
    flow.navigateToNextStep();
  };

  if (isLoading || !initialValues) return null;

  return (
    <BaseOnboardingScreen
      title="Select Agency"
      description="Search and select your representation agency"
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}>
      <AgencyForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
