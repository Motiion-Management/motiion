import React from 'react';
import { Pressable, View } from 'react-native';

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
    <Pressable
      onPress={onPress}
      className={cn(
        'rounded-full border px-4 py-2.5',
        hasValue ? 'border-border-accent bg-surface-high' : 'border-border-low bg-surface-default'
      )}>
      <View className="flex-row items-center justify-between">
        <Text
          variant="body"
          className={cn('font-medium', hasValue ? 'text-text-accent' : 'text-text-secondary')}>
          {label}
        </Text>
        <Text
          variant="body"
          className={cn('ml-2', hasValue ? 'text-text-accent' : 'text-text-tertiary')}>
          {displayValue}
        </Text>
      </View>
    </Pressable>
  );
}
