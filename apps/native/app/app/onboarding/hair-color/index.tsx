import { api } from '@packages/backend/convex/_generated/api';
import { HAIRCOLOR } from '@packages/backend/convex/validators/attributes';
import { useMutation } from 'convex/react';
import React from 'react';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingNavigation } from '~/hooks/useOnboardingStatus';

const hairColorValidator = z.object({
  hairColor: z.enum(HAIRCOLOR, {
    required_error: 'Please select a hair color',
  }),
});

type HairColor = (typeof HAIRCOLOR)[number];

export default function HairColorScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const { advanceToNextStep } = useOnboardingNavigation();

  const form = useAppForm({
    defaultValues: {
      hairColor: undefined as HairColor | undefined,
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

        await advanceToNextStep();
      } catch (error) {
        console.error('Error updating hair color:', error);
      }
    },
  });

  const radioOptions = HAIRCOLOR.map((color) => ({
    value: color,
    label: color,
  }));

  return (
    <OnboardingStepGuard requiredStep="hair-color">
      <BaseOnboardingScreen
        title="What color is your hair?"
        description="Select one"
        canProgress={form.state.canSubmit && !form.state.isSubmitting}
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
