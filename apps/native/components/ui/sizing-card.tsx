import React from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';

interface SizingCardProps {
  label: string;
  value?: string;
  onPress: () => void;
  unit?: string;
}

export function SizingCard({ label, value, onPress, unit }: SizingCardProps) {
  const hasValue = !!value;
  const displayValue = value ? `${value}${unit ? ` ${unit}` : ''}` : '+';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        'w-full flex-col items-start justify-center rounded-full border px-5 py-4',
        hasValue
          ? 'border-border-accent bg-surface-accent'
          : 'border-border-default bg-surface-high'
      )}>
      <Text variant="header6" className={cn('font-medium text-text-default')}>
        {label}
      </Text>
      <Text variant="labelXs" className={cn('text-text-low')}>
        {displayValue}
      </Text>
    </TouchableOpacity>
  );
}
