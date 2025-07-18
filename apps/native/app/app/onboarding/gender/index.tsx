import { api } from '@packages/backend/convex/_generated/api';
import { GENDER } from '@packages/backend/convex/validators/attributes';
import { useMutation } from 'convex/react';
import React from 'react';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';

const genderValidator = z.object({
  gender: z.enum(GENDER, {
    required_error: 'Please select your gender',
  }),
});

type Gender = (typeof GENDER)[number];

export default function GenderScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const cursor = useOnboardingCursor();

  const form = useAppForm({
    defaultValues: {
      gender: undefined as Gender | undefined,
    },
    validators: {
      onChange: genderValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.gender) return;

      try {
        await updateUser({
          attributes: {
            gender: value.gender,
          },
        });

        // Navigate to next step using cursor-based navigation
        cursor.goToNextStep();
      } catch (error) {
        console.error('Error updating gender:', error);
      }
    },
  });

  const radioOptions = GENDER.map((gender) => ({
    value: gender,
    label: gender,
  }));

  return (
    <OnboardingStepGuard requiredStep="gender">
      <BaseOnboardingScreen
        title="What best describes your gender?"
        description="Select one"
        canProgress={form.state.canSubmit && !form.state.isSubmitting}
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
