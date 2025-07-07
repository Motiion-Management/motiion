import { api } from '@packages/backend/convex/_generated/api';
import {
  ONBOARDING_STEPS,
  getNextOnboardingStep,
  type ProfileType,
} from '@packages/backend/convex/validators/users';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

const profileTypeValidator = z.object({
  profileType: z.enum(['dancer', 'choreographer'], {
    required_error: 'Please select a profile type',
  }),
});

export default function ProfileTypeScreen() {
  const router = useRouter();
  const updateUser = useMutation(api.users.updateMyUser);

  const form = useAppForm({
    defaultValues: {
      profileType: undefined as ProfileType | undefined,
    },
    validators: {
      onChange: profileTypeValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.profileType) return;

      try {
        const nextStep = getNextOnboardingStep(ONBOARDING_STEPS.PROFILE_TYPE, value.profileType);

        await updateUser({
          profileType: value.profileType,
          onboardingStep: nextStep,
        });

        // Navigate to the next step based on profile type
        switch (value.profileType) {
          case 'dancer':
            router.push('/(app)/onboarding/2'); // Will be dancer headshots
            break;
          case 'choreographer':
            router.push('/(app)/onboarding/10'); // Will be choreographer headshots
            break;
        }
      } catch (error) {
        console.error('Error updating profile type:', error);
      }
    },
  });

  const handleGuestContinue = async () => {
    try {
      const nextStep = getNextOnboardingStep(ONBOARDING_STEPS.PROFILE_TYPE, 'guest');

      await updateUser({
        profileType: 'guest',
        onboardingStep: nextStep,
      });

      router.push('/(app)/onboarding/20'); // Will be guest database
    } catch (error) {
      console.error('Error setting guest profile:', error);
    }
  };

  const radioOptions = [
    {
      value: 'dancer',
      label: 'Dancer',
    },
    {
      value: 'choreographer',
      label: 'Choreographer',
    },
  ];

  return (
    <BaseOnboardingScreen
      title="Your journey is unique. Your profile should be too."
      helpText="Select your main account type."
      canProgress={form.state.canSubmit && !form.state.isSubmitting}
      primaryAction={{
        onPress: () => form.handleSubmit(),
      }}
      secondaryAction={{
        text: 'Continue as guest',
        onPress: handleGuestContinue,
      }}>
      <ValidationModeForm form={form}>
        <form.AppField
          name="profileType"
          children={(field) => <field.RadioGroupField options={radioOptions} />}
        />
      </ValidationModeForm>
    </BaseOnboardingScreen>
  );
}
