// @ts-nocheck
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import React from 'react';
import { ScrollView } from 'react-native';

import { sizingValidator } from '~/components/form/SizingValidator';
import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { SizingSection } from '~/components/sizing/SizingSection';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';

export default function SizingScreen() {
  const updateUser = useMutation(api.users.updateMyUser);
  const user = useQuery(api.users.getMyUser);
  const cursor = useOnboardingCursor();

  const form = useAppForm({
    defaultValues: {
      general: user?.sizing?.general || {},
      male: user?.sizing?.male || {},
      female: user?.sizing?.female || {},
    },
    validators: {
      onChange: sizingValidator,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateUser({
          sizing: value,
        });

        // Navigate to next step using cursor-based navigation
        cursor.goToNextStep();
      } catch (error) {
        console.error('Error updating sizing:', error);
      }
    },
  });

  return (
    <OnboardingStepGuard requiredStep="sizing">
      <BaseOnboardingScreen
        title="Size Card"
        description="Optional - Not all sizing metrics may apply to you. Only input what is relevant to you."
        canProgress // Always true - all fields are optional
        primaryAction={{
          onPress: () => form.handleSubmit(),
        }}>
        <ValidationModeForm form={form}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}>
            <SizingSection
              title="General"
              metrics={['waist', 'inseam', 'glove', 'hat']}
              form={form}
            />
            <SizingSection
              title="Men"
              metrics={['chest', 'neck', 'sleeve', 'maleShirt', 'maleShoes', 'maleCoatLength']}
              form={form}
            />
            <SizingSection
              title="Women"
              metrics={[
                'dress',
                'bust',
                'underbust',
                'cup',
                'hip',
                'femaleShirt',
                'pants',
                'femaleShoes',
                'femaleCoatLength',
              ]}
              form={form}
            />
          </ScrollView>
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}
