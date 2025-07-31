import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import React, { useEffect } from 'react';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';
import { trackScreen, perfLog } from '~/utils/performanceDebug';
import { OnboardingScreenWrapper } from '~/components/onboarding/OnboardingScreenWrapper';

const profileTypeValidator = z.object({
  profileType: z.enum(['dancer', 'choreographer'], {
    required_error: 'Please select a profile type',
  }),
});

type ProfileType = 'dancer' | 'choreographer' | 'guest';

export default function ProfileTypeScreen() {
  return <OnboardingScreenWrapper v1Component={ProfileTypeScreenV1} screenName="profile-type" />;
}

function ProfileTypeScreenV1() {
  const updateUser = useMutation(api.users.updateMyUser);
  const cursor = useOnboardingCursor();

  // Track screen mount
  useEffect(() => {
    trackScreen.mountStart('ProfileTypeScreen');
    perfLog('screen:ProfileType:mounted');

    return () => {
      trackScreen.mountComplete('ProfileTypeScreen');
    };
  }, []);

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
        // Update the profile type
        await updateUser({
          profileType: value.profileType,
        });
      } catch (error) {
        console.error('Error updating profile type:', error);
      }
    },
  });

  const handleGuestContinue = async () => {
    try {
      // Update the profile type to guest
      await updateUser({
        profileType: 'guest',
      });
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
