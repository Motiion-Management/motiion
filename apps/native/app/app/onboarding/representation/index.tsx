import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import React from 'react';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';

const representationStatusOptions = [
  { value: 'represented', label: "Yes, I'm represented" },
  { value: 'seeking', label: 'No, but looking for representation' },
  { value: 'independent', label: "No, I'm an independent artist" },
];

const representationValidator = z.object({
  representationStatus: z.enum(['represented', 'seeking', 'independent'], {
    required_error: 'Please select your representation status',
  }),
});

export default function RepresentationScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const advanceStep = useMutation(api.onboarding.advanceOnboardingStep);
  const user = useQuery(api.users.getMyUser);

  const form = useAppForm({
    defaultValues: {
      representationStatus: user?.representationStatus,
    },
    validators: {
      onChange: representationValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.representationStatus) return;

      try {
        // Save the representation status
        await updateUser({
          representationStatus: value.representationStatus,
        });

        // Advance to next step using backend logic
        const result = await advanceStep();

        // Navigate to the route determined by backend
        router.push(result.route as any);
      } catch (error) {
        console.error('Error updating representation status:', error);
      }
    },
  });

  return (
    <OnboardingStepGuard requiredStep="representation">
      <BaseOnboardingScreen
        title="Are you represented by an agent?"
        description="Select one"
        helpText="Requires Verification"
        canProgress={form.state.canSubmit && !form.state.isSubmitting}
        primaryAction={{
          onPress: () => form.handleSubmit(),
          handlesNavigation: true,
        }}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="representationStatus"
            children={(field) => <field.RadioGroupField options={representationStatusOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
