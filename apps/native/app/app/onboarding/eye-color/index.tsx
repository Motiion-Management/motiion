import { api } from '@packages/backend/convex/_generated/api';
import { EYECOLOR } from '@packages/backend/convex/validators/attributes';
import { useMutation } from 'convex/react';
import React, { useEffect } from 'react';
import { toast } from 'sonner-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useHybridOnboarding } from '~/hooks/useHybridOnboarding';
import { useUser } from '~/hooks/useUser';

const eyeColorValidator = z.object({
  eyeColor: z.enum(EYECOLOR, {
    required_error: 'Please select an eye color',
  }),
});

type EyeColor = (typeof EYECOLOR)[number];

export default function EyeColorScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const hybrid = useHybridOnboarding();
  const { user } = useUser();

  // Get existing value from user
  const existingEyeColor = user?.attributes?.eyeColor as EyeColor | undefined;

  const form = useAppForm({
    defaultValues: {
      eyeColor: existingEyeColor || undefined,
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

        // Navigate if V3 is enabled
        if (hybrid.isV3Enabled) {
          hybrid.navigateNext();
        }
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

  // Track if we've already submitted this value to prevent loops
  const [lastSubmittedValue, setLastSubmittedValue] = React.useState<string | undefined>(existingEyeColor);

  // Auto-submit effect for V3
  useEffect(() => {
    const currentValue = form.state.values.eyeColor;
    
    if (
      hybrid.shouldAutoSubmit() && 
      isFormReady && 
      currentValue && 
      currentValue !== lastSubmittedValue && // Only submit if value changed
      currentValue !== existingEyeColor // And it's different from what's saved
    ) {
      const timer = setTimeout(() => {
        setLastSubmittedValue(currentValue);
        form.handleSubmit();
      }, hybrid.getSubmitDelay());
      
      return () => clearTimeout(timer);
    }
  }, [hybrid.shouldAutoSubmit(), hybrid.getSubmitDelay(), isFormReady, form.state.values.eyeColor, lastSubmittedValue, existingEyeColor]);

  // Use V3 step info if available
  const title = hybrid.currentStep?.title || "What color are your eyes?";
  const description = hybrid.currentStep?.description || "Select one";

  return (
    <OnboardingStepGuard requiredStep="eye-color">
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
            name="eyeColor"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}