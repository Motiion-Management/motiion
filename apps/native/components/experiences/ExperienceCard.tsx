import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';
import Check from '~/lib/icons/Check';
import { getExperienceDisplayTitle, getExperienceDisplaySubtitle } from '~/config/experienceTypes';

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
  experience?: any;
  disabled?: boolean;
  placeholder?: string;
  onPress: () => void;
  className?: string;
}

export function ExperienceCard({
  experience,
  onPress,
  variant = 'default',
  disabled = false,
  placeholder,
  className,
}: ExperienceCardProps) {
  const hasExperience = !!experience;
  const displayTitle = hasExperience
    ? getExperienceDisplayTitle(experience)
    : placeholder || 'Project';
  const displaySubtitle = hasExperience ? getExperienceDisplaySubtitle(experience) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={cn(experienceCardVariants({ variant }), className)}>
      <View className="flex-1">
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
      {variant === 'completed' && (
        <View className="ml-3">
          <Check className="h-5 w-5 color-icon-accent" />
        </View>
      )}
    </TouchableOpacity>
  );
}
