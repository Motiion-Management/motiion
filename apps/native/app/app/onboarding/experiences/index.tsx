import { router } from 'expo-router'
import React, { useMemo } from 'react';
import { View } from 'react-native';

import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { ExperienceCard } from '~/components/experiences/ExperienceCard';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

export default function ExperiencesScreen() {
  const experiences = useQuery(api.users.projects.getMyProjects, {});

  const slots = useMemo(() => {
    const docs = experiences || [];
    return [docs[0] || null, docs[1] || null, docs[2] || null] as (any | null)[];
  }, [experiences]);

  const firstEmptyIndex = useMemo(() => slots.findIndex((s) => !s), [slots]);

  const handleContinue = async () => {
    // Navigate to review group
    router.push('/app/onboarding/review')
  };

  const handleSkip = () => {
    router.push('/app/onboarding/review')
  }

  return (
    <BaseOnboardingScreen
        title="Add your experience"
        description="Add up to 3 projects you've worked on that you would like displayed on your profile."
        canProgress
        primaryAction={{
          onPress: handleContinue,
        }}
        secondaryAction={
          !experiences?.length
            ? {
                text: 'Skip for now',
                onPress: handleSkip,
              }
            : undefined
        }>
      <View className="flex-1 gap-4">
        {slots.map((exp, index) => {
          const isCompleted = !!exp;
          const isDisabled = !exp && firstEmptyIndex !== -1 && index !== firstEmptyIndex;
          const variant: 'completed' | 'default' | 'disabled' = isCompleted
            ? 'completed'
            : isDisabled
              ? 'disabled'
              : 'default';
          return (
            <ExperienceCard
              key={exp?._id ?? `slot-${index}`}
              experience={exp || undefined}
              experienceId={exp?._id}
              placeholder={`Project ${index + 1}`}
              variant={variant}
              disabled={isDisabled}
            />
          );
        })}
      </View>
      </BaseOnboardingScreen>
  );
}
