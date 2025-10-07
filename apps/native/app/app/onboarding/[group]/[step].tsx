import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow';
import { useOnboardingData } from '~/hooks/useOnboardingData';
import { STEP_REGISTRY } from '~/onboarding/registry';
import type { FormHandle } from '~/components/forms/onboarding/contracts';

export default function DynamicOnboardingStep() {
  const { group, step } = useLocalSearchParams<{ group: string; step: string }>();
  const flow = useOnboardingGroupFlow();
  const { data, isLoading } = useOnboardingData();

  console.log({ group, step, data, isLoading });
  console.log(JSON.stringify(flow, null, 2));
  // Get step definition from registry
  const stepDef = step ? STEP_REGISTRY[step as keyof typeof STEP_REGISTRY] : undefined;

  // Mutations for saving data
  const updateMyUser = useMutation(api.users.users.updateMyUser);
  const patchDancerAttributes = useMutation(api.dancers.patchDancerAttributes);
  const updateMyDancerProfile = useMutation(api.dancers.updateMyDancerProfile);
  const updateMyChoreographerProfile = useMutation(api.choreographers.updateMyChoreographerProfile);
  const addMyRepresentation = useMutation(api.users.representation.addMyRepresentation);
  const createDancerProfile = useMutation(api.dancers.createDancerProfile);
  const createChoreographerProfile = useMutation(api.choreographers.createChoreographerProfile);

  const formRef = useRef<FormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [initialValues, setInitialValues] = useState<any>(null);

  // Load initial values
  useEffect(() => {
    if (isLoading || !stepDef) return;
    const res = stepDef.getInitialValues(data);
    Promise.resolve(res).then(setInitialValues);
  }, [data, isLoading, stepDef]);

  const handleSubmit = async (values: any) => {
    // Update conditional state if this step affects navigation
    if (step === 'representation' && values.representationStatus) {
      flow.setRepresentationStatus(values.representationStatus);
    }

    // For profile-type step, save MUST complete before navigation
    if (step === 'profile-type' && stepDef?.save) {
      await stepDef.save(values, {
        data,
        updateMyUser,
        patchDancerAttributes,
        updateMyDancerProfile,
        updateMyChoreographerProfile,
        addMyRepresentation,
        createDancerProfile,
        createChoreographerProfile,
      });
    }

    // Navigate after critical saves complete
    flow.navigateToNextStep();

    // Other steps can save in background (fire-and-forget)
    if (step !== 'profile-type' && stepDef?.save) {
      stepDef
        .save(values, {
          data,
          updateMyUser,
          patchDancerAttributes,
          updateMyDancerProfile,
          updateMyChoreographerProfile,
          addMyRepresentation,
          createDancerProfile,
          createChoreographerProfile,
        })
        .catch((error) => {
          console.error(`Failed to save ${step} data:`, error);
          // Could show a toast notification here
        });
    }
  };

  if (!stepDef) {
    console.warn(`No step definition found for: ${step}`);
    return null;
  }

  if (isLoading || !initialValues) return null;

  const FormComponent = stepDef.Component as any;

  return (
    <BaseOnboardingScreen
      title={stepDef.title}
      description={stepDef.description}
      canProgress={canSubmit}
      primaryAction={{
        onPress: () => formRef.current?.submit(),
        handlesNavigation: true,
      }}>
      <FormComponent
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onValidChange={setCanSubmit}
      />
    </BaseOnboardingScreen>
  );
}
