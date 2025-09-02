import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

import { TrainingCard } from '~/components/training/TrainingCard';
import type { FormHandle, FormProps } from '~/components/forms/onboarding/contracts';

export interface TrainingValues {
  // saved via TrainingCard interactions
}

export const TrainingForm = forwardRef<FormHandle, FormProps<TrainingValues>>(function TrainingForm(
  { onSubmit, onValidChange },
  ref
) {
  const training = useQuery(api.training.getMyTraining, {});

  const slots = useMemo(() => {
    const docs = training || [];
    return [docs[0] || null, docs[1] || null, docs[2] || null] as (any | null)[];
  }, [training]);

  const firstEmptyIndex = useMemo(() => slots.findIndex((s) => !s), [slots]);

  useImperativeHandle(ref, () => ({
    submit: () => onSubmit({}),
    isDirty: () => false,
    isValid: () => true,
  }));

  useEffect(() => {
    onValidChange?.(true);
  }, [onValidChange]);

  return (
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
  );
});
