import { api } from '@packages/backend/convex/_generated/api';
import { ETHNICITY } from '@packages/backend/convex/validators/attributes';
import { useStore } from '@tanstack/react-form';
import { useMutation } from 'convex/react';
import React, { useEffect } from 'react';
import { toast } from 'sonner-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useHybridOnboarding } from '~/hooks/useHybridOnboarding';

const ethnicityValidator = z.object({
  ethnicity: z.array(z.enum(ETHNICITY)).min(1, 'Please select at least one ethnicity'),
});

export default function EthnicityScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const hybrid = useHybridOnboarding();

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

        // Navigate if V3 is enabled
        if (hybrid.isV3Enabled) {
          hybrid.navigateNext();
        }
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

  const isFormReady = useStore(form.store, (state) => state.canSubmit && state.isDirty);

  // Track if we've already submitted this value to prevent loops
  const [lastSubmittedValue, setLastSubmittedValue] = React.useState<string | undefined>();

  // Auto-submit effect for V3
  useEffect(() => {
    const currentValue = JSON.stringify(form.state.values.ethnicity);

    if (
      hybrid.shouldAutoSubmit() &&
      isFormReady &&
      form.state.values.ethnicity?.length > 0 &&
      currentValue !== lastSubmittedValue // Only submit if value changed
    ) {
      const timer = setTimeout(() => {
        setLastSubmittedValue(currentValue);
        form.handleSubmit();
      }, hybrid.getSubmitDelay());

      return () => clearTimeout(timer);
    }
  }, [
    hybrid.shouldAutoSubmit(),
    hybrid.getSubmitDelay(),
    isFormReady,
    form.state.values.ethnicity,
    lastSubmittedValue,
  ]);

  // Use V3 step info if available
  const title = hybrid.currentStep?.title || "What's your ethnicity?";
  const description = hybrid.currentStep?.description || 'Select all that apply';

  return (
    <BaseOnboardingScreen
      title={title}
      description={description}
      canProgress={isFormReady}
      primaryAction={{
        onPress: () => form.handleSubmit(),
        handlesNavigation: hybrid.isV3Enabled,
      }}>
      <ValidationModeForm form={form}>
        <form.AppField
          name="ethnicity"
          children={(field) => <field.CheckboxGroupField options={ethnicityOptions} />}
        />
      </ValidationModeForm>
    </BaseOnboardingScreen>
  );
}
