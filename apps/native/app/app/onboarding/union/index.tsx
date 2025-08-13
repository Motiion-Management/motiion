import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { useStore } from '@tanstack/react-form';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';
import { useUser } from '~/hooks/useUser';

const unionValidator = z.object({
  sagAftraId: z.string().optional(),
});
type UnionSchema = z.infer<typeof unionValidator>;

export default function UnionScreen() {
  const onboarding = useSimpleOnboardingFlow();
  const updateMyUser = useMutation(api.users.updateMyUser);
  const { user } = useUser();

  const form = useAppForm({
    defaultValues: {
      sagAftraId: user?.sagAftraId || '',
    } as UnionSchema,
    validators: {
      onChange: unionValidator,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMyUser({
          sagAftraId: value.sagAftraId || undefined,
        });

        // Navigate to next step after successful save
        onboarding.navigateNext();
      } catch (error) {
        console.error('Error saving SAG-AFTRA ID:', error);
      }
    },
  });

  const canProgress = useStore(form.store, (s) => s.canSubmit);

  const handleSkip = useCallback(() => {
    onboarding.navigateNext();
  }, [onboarding]);

  return (
    <BaseOnboardingScreen
      title="Are you a member of SAG-AFTRA?"
      description="Enter your member ID. Please skip if you are not a member."
      canProgress={canProgress}
      primaryAction={{
        onPress: () => form.handleSubmit(),
        disabled: !canProgress,
        handlesNavigation: true,
      }}
      secondaryAction={{
        text: 'Skip for now',
        onPress: handleSkip,
      }}>
      <ValidationModeForm form={form}>
        <View className="gap-6">
          <form.AppField
            name="sagAftraId"
            children={(field) => (
              <field.InputField 
                label="MEMBER ID" 
                placeholder="12345678"
                keyboardType="numeric"
              />
            )}
          />
        </View>
      </ValidationModeForm>
    </BaseOnboardingScreen>
  );
}
