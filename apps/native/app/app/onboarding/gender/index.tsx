import { api } from '@packages/backend/convex/_generated/api';
import { GENDER } from '@packages/backend/convex/validators/attributes';
import { useMutation } from 'convex/react';
import React from 'react';
import { toast } from 'sonner-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useUser } from '~/hooks/useUser';

const genderValidator = z.object({
  gender: z.enum(GENDER, {
    required_error: 'Please select your gender',
  }),
});

export default function GenderScreen() {
  const patchUserAttributes = useMutation(api.users.patchUserAttributes);
  const { user } = useUser();

  // Get existing value from user
  const existingGender = user?.attributes?.gender;

  const form = useAppForm({
    defaultValues: {
      gender: existingGender,
    },
    validators: {
      onChange: genderValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.gender) return;

      try {
        await patchUserAttributes({
          attributes: { gender: value.gender },
        });
      } catch (error) {
        console.error('Error updating gender:', error);
        toast.error('Failed to update gender. Please try again.');
      }
    },
  });

  const radioOptions = GENDER.map((gender) => ({
    value: gender,
    label: gender,
  }));

  const isFormReady = form.state.canSubmit && !form.state.isSubmitting;

  return (
    <OnboardingStepGuard requiredStep="gender">
      <BaseOnboardingScreen
        title="What best describes your gender?"
        description="Select one"
        canProgress={isFormReady}
        primaryAction={{
          onPress: () => form.handleSubmit(),
        }}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="gender"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
