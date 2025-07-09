import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingStatus } from '~/hooks/useOnboardingStatus';

const profileTypeValidator = z.object({
  profileType: z.enum(['dancer', 'choreographer'], {
    required_error: 'Please select a profile type',
  }),
});

type ProfileType = 'dancer' | 'choreographer' | 'guest';

export default function ProfileTypeScreen() {
  const router = useRouter();
  const updateUser = useMutation(api.users.updateMyUser);
  const { getNextStepRoute } = useOnboardingStatus();

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
        // Just update the profile type - the system will determine the next step
        await updateUser({
          profileType: value.profileType,
        });

        // Navigate to the next step
        const nextRoute = getNextStepRoute();
        if (nextRoute) {
          router.push(nextRoute);
        } else {
          router.push('/(app)');
        }
      } catch (error) {
        console.error('Error updating profile type:', error);
      }
    },
  });

  const handleGuestContinue = async () => {
    try {
      // Just update the profile type - the system will determine the next step
      await updateUser({
        profileType: 'guest',
      });

      // Navigate to the next step
      const nextRoute = getNextStepRoute();
      if (nextRoute) {
        router.push(nextRoute);
      } else {
        router.push('/(app)');
      }
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
    <OnboardingStepGuard requiredStep="profile-type">
      <BaseOnboardingScreen
        title="Your journey is unique. Your profile should be too."
        description="Select your main account type."
        canProgress={form.state.canSubmit && !form.state.isSubmitting}
        showBackButton={false}
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
    </OnboardingStepGuard>
  );
}
