import { api } from '@packages/backend/convex/_generated/api';
import { HAIRCOLOR } from '@packages/backend/convex/validators/attributes';
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

const hairColorValidator = z.object({
  hairColor: z.enum(HAIRCOLOR, {
    required_error: 'Please select a hair color',
  }),
});

type HairColor = (typeof HAIRCOLOR)[number];

export default function HairColorScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const hybrid = useHybridOnboarding();
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

        // Navigate if V3 is enabled
        if (hybrid.isV3Enabled) {
          hybrid.navigateNext();
        }
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

  // Track if we've already submitted this value to prevent loops
  const [lastSubmittedValue, setLastSubmittedValue] = React.useState<string | undefined>(existingHairColor);

  // Auto-submit effect for V3
  useEffect(() => {
    const currentValue = form.state.values.hairColor;
    
    if (
      hybrid.shouldAutoSubmit() && 
      isFormReady && 
      currentValue && 
      currentValue !== lastSubmittedValue && // Only submit if value changed
      currentValue !== existingHairColor // And it's different from what's saved
    ) {
      const timer = setTimeout(() => {
        setLastSubmittedValue(currentValue);
        form.handleSubmit();
      }, hybrid.getSubmitDelay());
      
      return () => clearTimeout(timer);
    }
  }, [hybrid.shouldAutoSubmit(), hybrid.getSubmitDelay(), isFormReady, form.state.values.hairColor, lastSubmittedValue, existingHairColor]);

  // Use V3 step info if available
  const title = hybrid.currentStep?.title || "What color is your hair?";
  const description = hybrid.currentStep?.description || "Select one";

  return (
    <OnboardingStepGuard requiredStep="hair-color">
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
            name="hairColor"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}