import { api } from '@packages/backend/convex/_generated/api';
import { HAIRCOLOR } from '@packages/backend/convex/validators/attributes';
import { useMutation } from 'convex/react';
import React from 'react';
import { toast } from 'sonner-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useUser } from '~/hooks/useUser';

const hairColorValidator = z.object({
  hairColor: z.enum(HAIRCOLOR, {
    required_error: 'Please select a hair color',
  }),
});

type HairColor = (typeof HAIRCOLOR)[number];

export default function HairColorScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const { user } = useUser();

  // Get existing value from user
  const existingHairColor = user?.attributes?.hairColor as HairColor | undefined;

  const form = useAppForm({
    defaultValues: {
      hairColor: existingHairColor || undefined,
    },
    validators: {
      onChange: hairColorValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.hairColor) return;

      try {
        await updateUser({
          attributes: {
            hairColor: value.hairColor,
          },
        });
      } catch (error) {
        console.error('Error updating hair color:', error);
        toast.error('Failed to update hair color. Please try again.');
      }
    },
  });

  const radioOptions = HAIRCOLOR.map((color) => ({
    value: color,
    label: color,
  }));

  const isFormReady = form.state.canSubmit && !form.state.isSubmitting;

  return (
    <OnboardingStepGuard requiredStep="hair-color">
      <BaseOnboardingScreen
        title="What color is your hair?"
        description="Select one"
        canProgress={isFormReady}
        primaryAction={{
          onPress: () => form.handleSubmit(),
        }}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="hairColor"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
