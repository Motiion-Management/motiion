import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import React from 'react';
import { View } from 'react-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { useStore } from '@tanstack/react-form';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';
import { useUser } from '~/hooks/useUser';

const displayNameValidator = z.object({
  displayName: z
    .string()
    .min(1, { message: 'Preferred name is required' })
    .min(2, { message: 'Preferred name must be at least 2 characters' })
    .max(50, { message: 'Preferred name must be less than 50 characters' }),
});

type DisplayNameSchema = z.infer<typeof displayNameValidator>;

export default function DisplayNameScreen() {
  const onboarding = useSimpleOnboardingFlow();
  const updateMyUser = useMutation(api.users.updateMyUser);
  const { user } = useUser();

  const form = useAppForm({
    defaultValues: {
      displayName: user?.displayName || user?.fullName || '',
    } as DisplayNameSchema,
    validators: {
      onChange: displayNameValidator,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMyUser({
          displayName: value.displayName.trim(),
        });

        // Navigate to next step after successful save
        onboarding.navigateNext();
      } catch (error) {
        console.error('Error saving display name:', error);
      }
    },
  });

  const canProgress = useStore(form.store, (s) => s.canSubmit);

  return (
    <OnboardingStepGuard requiredStep="display-name">
      <BaseOnboardingScreen
        title="What name do you want displayed?"
        description="This will be the name displayed on your public profile. If you go by another name professionally, you should enter it here."
        canProgress={canProgress}
        primaryAction={{
          onPress: () => form.handleSubmit(),
          disabled: !canProgress,
          handlesNavigation: true,
        }}>
        <ValidationModeForm form={form}>
          <View className="gap-6">
            <form.AppField
              name="displayName"
              children={(field) => (
                <field.InputField
                  label="PREFERRED NAME"
                  placeholder="Enter your preferred name"
                  autoCapitalize="words"
                  autoComplete="name"
                  autoFocus
                />
              )}
            />
          </View>
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
