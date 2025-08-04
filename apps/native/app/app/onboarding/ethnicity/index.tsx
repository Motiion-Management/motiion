import { api } from '@packages/backend/convex/_generated/api';
import { ETHNICITY } from '@packages/backend/convex/validators/attributes';
import { useStore } from '@tanstack/react-form';
import { useMutation } from 'convex/react';
import React from 'react';
import { toast } from 'sonner-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useUser } from '~/hooks/useUser';

const ethnicityValidator = z.object({
  ethnicity: z.array(z.enum(ETHNICITY)).min(1, 'Please select at least one ethnicity'),
});

export default function EthnicityScreen() {
  const { user } = useUser();
  console.log('EthnicityScreen user:', user.attributes);
  const updateUser = useMutation(api.users.updateMyUser);

  const form = useAppForm({
    defaultValues: {
      ethnicity: user?.attributes?.ethnicity,
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
            ...user.attributes,
            ethnicity: value.ethnicity,
          },
        });
      } catch (error) {
        console.error('Error updating ethnicity:', error);
        toast.error('Failed to update ethnicity. Please try again.');
      }
    },
  });

  const ethnicityOptions = ETHNICITY.map((ethnicity) => ({
    value: ethnicity,
    label: ethnicity,
  }));

  const isFormReady =
    useStore(form.store, (state) => state.canSubmit && state.isDirty) ||
    !!(user?.attributes?.ethnicity?.length && user.attributes.ethnicity.length > 0);

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
