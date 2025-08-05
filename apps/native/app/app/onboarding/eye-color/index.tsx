import { api } from '@packages/backend/convex/_generated/api';
import { EYECOLOR } from '@packages/backend/convex/validators/attributes';
import { useMutation } from 'convex/react';
import React from 'react';
import { toast } from 'sonner-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useUser } from '~/hooks/useUser';

const eyeColorValidator = z.object({
  eyeColor: z.enum(EYECOLOR, {
    required_error: 'Please select an eye color',
  }),
});

export default function EyeColorScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const { user } = useUser();

  // Get existing value from user
  const existingEyeColor = user?.attributes?.eyeColor;

  const form = useAppForm({
    defaultValues: {
      eyeColor: existingEyeColor,
    },
    validators: {
      onChange: eyeColorValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.eyeColor) return;

      try {
        await updateUser({
          attributes: {
            ...user.attributes,
            eyeColor: value.eyeColor,
          },
        });
      } catch (error) {
        console.error('Error updating eye color:', error);
        toast.error('Failed to update eye color. Please try again.');
      }
    },
  });

  const radioOptions = EYECOLOR.map((color) => ({
    value: color,
    label: color,
  }));

  const isFormReady = form.state.canSubmit && !form.state.isSubmitting;

  return (
    <OnboardingStepGuard requiredStep="eye-color">
      <BaseOnboardingScreen
        title="What color are your eyes?"
        description="Select one"
        canProgress={isFormReady}
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
