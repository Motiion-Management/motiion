import { api } from '@packages/backend/convex/_generated/api';
import { ETHNICITY } from '@packages/backend/convex/validators/attributes';
import { useStore } from '@tanstack/react-form';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { toast } from 'sonner-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingNavigation } from '~/hooks/useOnboardingStatus';

const ethnicityValidator = z.object({
  ethnicity: z.array(z.enum(ETHNICITY)).min(1, 'Please select at least one ethnicity'),
});

export default function EthnicityScreen() {
  const router = useRouter();
  const updateUser = useMutation(api.users.updateMyUser);
  const { advanceToNextStep } = useOnboardingNavigation();

  const form = useAppForm({
    defaultValues: {
      ethnicity: [] as (typeof ETHNICITY)[number][],
    },
    validators: {
      onChange: ethnicityValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.ethnicity?.length) return;

      try {
        // Update user ethnicity in attributes
        await updateUser({
          attributes: {
            ethnicity: value.ethnicity,
          },
        });

        // Navigate to the next step
        const result = await advanceToNextStep();
        if (result.route) {
          router.push(result.route);
        } else {
          // If no next step, onboarding is complete
          router.push('/app/home');
        }
      } catch (error) {
        console.log('Error updating ethnicity:', error);

        // Show appropriate error message to user
        if (error instanceof Error) {
          if (error.message.includes('Cannot advance')) {
            toast.error('Please complete the ethnicity step before continuing');
          } else if (error.message.includes('Failed to save')) {
            toast.error('Failed to save ethnicity. Please try again.');
          } else {
            toast.error('An error occurred. Please try again.');
          }
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
      }
    },
  });

  const ethnicityOptions = ETHNICITY.map((ethnicity) => ({
    value: ethnicity,
    label: ethnicity,
  }));

  const isFormReady = useStore(form.store, (state) => state.canSubmit && state.isDirty);

  return (
    <OnboardingStepGuard requiredStep="ethnicity">
      <BaseOnboardingScreen
        title="What's your ethnicity?"
        description="Select all that apply"
        canProgress={isFormReady}
        primaryAction={{
          onPress: () => form.handleSubmit(),
        }}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="ethnicity"
            children={(field) => <field.CheckboxGroupField options={ethnicityOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
