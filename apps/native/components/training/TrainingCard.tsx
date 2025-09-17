import React, { useState, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';
import Check from '~/lib/icons/Check';
import Plus from '~/lib/icons/Plus';
import { getTrainingDisplayTitle, getTrainingDisplaySubtitle } from '~/config/trainingTypes';
import { TrainingEditSheet } from './TrainingEditSheet';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { type TrainingFormDoc } from '@packages/backend/convex/schemas/training';

const trainingCardVariants = cva(
  'w-full flex-row items-center justify-between rounded-full border px-5 py-4',
  {
    variants: {
      variant: {
        default: 'border-border-default bg-surface-high',
        disabled: 'border-border-default bg-surface-high opacity-50',
        completed: 'border-border-accent bg-surface-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface TrainingCardProps extends VariantProps<typeof trainingCardVariants> {
  training?: TrainingFormDoc;
  trainingId?: Id<'training'>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function TrainingCard({
  training,
  trainingId,
  variant = 'default',
  disabled = false,
  placeholder,
  className,
}: TrainingCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const handlePress = useCallback(() => {
    if (disabled) return;
    setIsSheetOpen(true);
  }, [disabled]);
  const hasTraining = !!training;
  const displayTitle = hasTraining ? getTrainingDisplayTitle(training) : placeholder || 'Training';
  const displaySubtitle = hasTraining
    ? getTrainingDisplaySubtitle(training)
    : disabled
      ? '-'
      : 'Add your training here';

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        className={cn(trainingCardVariants({ variant }), className)}>
        <View className="flex-1 px-2">
          <Text
            variant="body"
            className={cn(
              'font-medium',
              variant === 'disabled' ? 'text-text-low' : 'text-text-default'
            )}>
            {displayTitle}
          </Text>
          {displaySubtitle && (
            <Text variant="footnote" className="text-text-low">
              {displaySubtitle}
            </Text>
          )}
        </View>
        <View className="ml-3">
          {variant === 'completed' ? (
            <Check className="h-5 w-5 color-icon-accent" />
          ) : (
            <Plus className="h-5 w-5 color-icon-low" />
          )}
        </View>
      </TouchableOpacity>

      {/* Local bottom sheet for this card */}
      <TrainingEditSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        training={training}
        trainingId={trainingId}
      />
    </>
  );
}
