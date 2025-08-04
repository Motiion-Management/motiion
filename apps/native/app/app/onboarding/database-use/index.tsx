import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import React from 'react';
import { toast } from 'sonner-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';

const databaseUseValidator = z.object({
  databaseUse: z.string().min(1, 'Please describe how you will use the database'),
});

export default function DatabaseUseScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const user = useQuery(api.users.getMyUser);

  const form = useAppForm({
    defaultValues: {
      databaseUse: user?.databaseUse || '',
    },
    validators: {
      onChange: databaseUseValidator,
    },
    onSubmit: async ({ value }) => {
      if (!value.databaseUse) return;

      try {
        await updateUser({
          databaseUse: value.databaseUse,
        });
      } catch (error) {
        console.error('Error updating database use:', error);
        toast.error('Failed to update database use. Please try again.');
      }
    },
  });

  const isFormReady = form.state.canSubmit && !form.state.isSubmitting;

  return (
    <OnboardingStepGuard requiredStep="database-use">
      <BaseOnboardingScreen
        title="How will you use this database?"
        description="Tell us about your intended use"
        canProgress={isFormReady}
        primaryAction={{
          onPress: () => form.handleSubmit(),
        }}>
        <ValidationModeForm form={form}>
          <form.AppField
            name="databaseUse"
            children={(field) => (
              <field.TextAreaField
                placeholder="Describe how you plan to use the database..."
                rows={4}
              />
            )}
          />
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
