import { api } from '@packages/backend/convex/_generated/api';
import { GENDER } from '@packages/backend/convex/validators/attributes';
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

const genderValidator = z.object({
  gender: z.enum(GENDER, {
    required_error: 'Please select your gender',
  }),
});

type Gender = (typeof GENDER)[number];

export default function GenderScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const hybrid = useHybridOnboarding();
  const { user } = useUser();

  // Get existing value from user
  const existingGender = user?.attributes?.gender as Gender | undefined;

  const form = useAppForm({
    defaultValues: {
      gender: existingGender || undefined,
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

        // Navigate if V3 is enabled
        if (hybrid.isV3Enabled) {
          hybrid.navigateNext();
        }
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

  // Track if we've already submitted this value to prevent loops
  const [lastSubmittedValue, setLastSubmittedValue] = React.useState<string | undefined>(existingGender);

  // Auto-submit effect for V3
  useEffect(() => {
    const currentValue = form.state.values.gender;
    
    if (
      hybrid.shouldAutoSubmit() && 
      isFormReady && 
      currentValue && 
      currentValue !== lastSubmittedValue && // Only submit if value changed
      currentValue !== existingGender // And it's different from what's saved
    ) {
      const timer = setTimeout(() => {
        setLastSubmittedValue(currentValue);
        form.handleSubmit();
      }, hybrid.getSubmitDelay());
      
      return () => clearTimeout(timer);
    }
  }, [hybrid.shouldAutoSubmit(), hybrid.getSubmitDelay(), isFormReady, form.state.values.gender, lastSubmittedValue, existingGender]);

  // Use V3 step info if available
  const title = hybrid.currentStep?.title || "What best describes your gender?";
  const description = hybrid.currentStep?.description || "Select one";

  return (
    <OnboardingStepGuard requiredStep="gender">
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
            name="gender"
            children={(field) => <field.RadioGroupField options={radioOptions} />}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}