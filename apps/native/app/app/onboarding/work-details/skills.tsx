import React, { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { SkillsForm, type SkillsValues } from '~/components/forms/onboarding/SkillsForm';
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow';
import { useOnboardingData } from '~/hooks/useOnboardingData';
import { STEP_REGISTRY } from '~/onboarding/registry';
import type { FormHandle } from '~/components/forms/onboarding/contracts';

export default function SkillsScreen() {
  const flow = useOnboardingGroupFlow();
  const { data, isLoading } = useOnboardingData();
  const updateMyResume = useMutation(api.users.resume.updateMyResume);

  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [initialValues, setInitialValues] = useState<SkillsValues | null>(null);

  useEffect(() => {
    if (isLoading) return;
    const res = STEP_REGISTRY['skills'].getInitialValues(data);
    Promise.resolve(res).then((vals) => setInitialValues(vals as SkillsValues));
  }, [data, isLoading]);

  const handleSubmit = async (values: SkillsValues) => {
    await updateMyResume({
      ...values,
      experiences: data.user?.resume?.experiences,
    });
    flow.navigateToNextStep();
  };

  if (isLoading || !initialValues) return null;

  return (
    <BaseOnboardingScreen
      title="Add your skills"
      description="What genre and special skills are you proficient in?"
      canProgress={canSubmit}
      primaryAction={{ onPress: () => formRef.current?.submit(), handlesNavigation: true }}>
      <SkillsForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
