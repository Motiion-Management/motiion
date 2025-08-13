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
import { zResume } from '@packages/backend/convex/validators/users';

const skillsValidator = zResume.pick({ skills: true, genres: true });
type SkillsSchema = z.infer<typeof skillsValidator>;

export default function SkillsScreen() {
  const onboarding = useSimpleOnboardingFlow();
  const updateMyResume = useMutation(api.users.resume.updateMyResume);
  const { user } = useUser();

  const form = useAppForm({
    defaultValues: {
      genres: user?.resume?.genres,
      skills: user?.resume?.skills,
    } as SkillsSchema,
    validators: {
      onChange: skillsValidator,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMyResume({
          ...value,
          experiences: user?.resume?.experiences,
        });

        // Navigate to next step after successful save
        onboarding.navigateNext();
      } catch (error) {
        console.error('Error saving skills:', error);
      }
    },
  });

  const canProgress = useStore(
    form.store,
    (s) => (s.values.genres?.length ?? 0) > 0 && (s.values.skills?.length ?? 0) > 0 && s.canSubmit
  );

  const handleSkip = useCallback(() => {
    onboarding.navigateNext();
  }, [onboarding]);

  return (
    <BaseOnboardingScreen
      title="Add your skills"
      description="What genre and special skills are you proficient in?"
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
            name="genres"
            children={(field) => (
              <field.ChipsField
                label="GENRES"
                placeholder="Hip Hop, Musical Theater, Tap Dance..."
                autoCapitalize="words"
              />
            )}
          />

          <form.AppField
            name="skills"
            children={(field) => (
              <field.ChipsField
                label="SKILLS"
                placeholder="Breaking, Juggling, Skateboarding..."
                autoCapitalize="words"
              />
            )}
          />
        </View>
      </ValidationModeForm>
    </BaseOnboardingScreen>
  );
}
