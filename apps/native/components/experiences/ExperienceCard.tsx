import React, { useState, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';
import Check from '~/lib/icons/Check';
import Plus from '~/lib/icons/Plus';
import { getProjectDisplayTitle as getExperienceDisplayTitle, getProjectDisplaySubtitle as getExperienceDisplaySubtitle } from '~/config/projectTypes';
import { ExperienceEditSheet } from './ExperienceEditSheet';
import { type Doc, type Id } from '@packages/backend/convex/_generated/dataModel';

const experienceCardVariants = cva(
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

interface ExperienceCardProps extends VariantProps<typeof experienceCardVariants> {
  experience?: Doc<'experiences'>;
  experienceId?: Id<'experiences'>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ExperienceCard({
  experience,
  experienceId,
  variant = 'default',
  disabled = false,
  placeholder,
  className,
}: ExperienceCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const handlePress = useCallback(() => {
    if (disabled) return;
    setIsSheetOpen(true);
  }, [disabled]);
  const hasExperience = !!experience;
  const displayTitle = hasExperience
    ? getExperienceDisplayTitle(experience)
    : placeholder || 'Project';
  const displaySubtitle = hasExperience
    ? getExperienceDisplaySubtitle(experience)
    : disabled
      ? '-'
      : 'Add your project here';

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        className={cn(experienceCardVariants({ variant }), className)}>
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
      <ExperienceEditSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        experience={experience}
        experienceId={experienceId}
      />
    </>
  );
}
