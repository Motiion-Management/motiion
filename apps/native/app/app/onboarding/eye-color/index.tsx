import { api } from '@packages/backend/convex/_generated/api';
import { EYECOLOR } from '@packages/backend/convex/validators/attributes';
import { useMutation } from 'convex/react';
import React from 'react';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';

const eyeColorValidator = z.object({
  eyeColor: z.enum(EYECOLOR, {
    required_error: 'Please select an eye color',
  }),
});

type EyeColor = (typeof EYECOLOR)[number];

export default function EyeColorScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const cursor = useOnboardingCursor();

  const form = useAppForm({
    defaultValues: {
      eyeColor: undefined as EyeColor | undefined,
    },
    validators: {
      onChange: eyeColorValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.eyeColor) return;

      try {
        await updateUser({
          attributes: {
            eyeColor: value.eyeColor,
          },
        });

        // Navigate to next step using cursor-based navigation
        cursor.goToNextStep();
      } catch (error) {
        console.error('Error updating eye color:', error);
      }
    },
  });

  const radioOptions = EYECOLOR.map((color) => ({
    value: color,
    label: color,
  }));

  return (
    <OnboardingStepGuard requiredStep="eye-color">
      <BaseOnboardingScreen
        title="What color are your eyes?"
        description="Select one"
        canProgress={form.state.canSubmit && !form.state.isSubmitting}
        primaryAction={{
          onPress: () => form.handleSubmit(),
        }}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="eyeColor"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
