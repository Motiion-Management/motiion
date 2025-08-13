import React, { useMemo } from 'react';
import { View } from 'react-native';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { TrainingCard } from '~/components/training/TrainingCard';
import { useSimpleOnboardingFlow } from '~/hooks/useSimpleOnboardingFlow';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
export default function TrainingScreen() {
  const onboarding = useSimpleOnboardingFlow();
  const training = useQuery(api.training.getMyTraining, {});

  const slots = useMemo(() => {
    const docs = training || [];
    return [docs[0] || null, docs[1] || null, docs[2] || null] as (any | null)[];
  }, [training]);

  const firstEmptyIndex = useMemo(() => slots.findIndex((s) => !s), [slots]);

  return (
    <BaseOnboardingScreen
      title="Add your training"
      description="Add up to 3 training details. People commonly include dance teams, schools, and training programs."
      canProgress
      secondaryAction={
        !training?.length
          ? {
              text: 'Skip for now',
              onPress: () => onboarding.navigateNext(),
            }
          : undefined
      }>
      <View className="flex-1 gap-4">
        {slots.map((tr, index) => {
          const isCompleted = !!tr;
          const isDisabled = !tr && firstEmptyIndex !== -1 && index !== firstEmptyIndex;
          const variant: 'completed' | 'default' | 'disabled' = isCompleted
            ? 'completed'
            : isDisabled
              ? 'disabled'
              : 'default';
          return (
            <TrainingCard
              key={tr?._id ?? `slot-${index}`}
              training={tr || undefined}
              trainingId={tr?._id}
              placeholder={`Training ${index + 1}`}
              variant={variant}
              disabled={isDisabled}
            />
          );
        })}
      </View>
    </BaseOnboardingScreen>
  );
}
