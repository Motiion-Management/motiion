import React from 'react';
import { View, Pressable } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';
import X from '~/lib/icons/X';

const chipVariants = cva('flex-row items-center gap-2 rounded-full border px-3 py-1', {
  variants: {
    variant: {
      filter: 'border-border-low bg-surface-high',
      combo: 'border-border-low bg-surface-low',
    },
  },
  defaultVariants: {
    variant: 'combo',
  },
});

const chipTextVariants = cva('', {
  variants: {
    variant: {
      filter: 'text-text-default',
      combo: 'text-text-high',
    },
  },
  defaultVariants: {
    variant: 'combo',
  },
});

type ChipVariantProps = VariantProps<typeof chipVariants>;

export interface ChipsProps extends ChipVariantProps {
  items: string[];
  className?: string;
  chipClassName?: string;
  onRemove?: (item: string) => void;
}

export function Chips({ items, className, chipClassName, onRemove, variant }: ChipsProps) {
  if (!items || items.length === 0) return null;

  return (
    <View className={cn('mt-2 flex-row flex-wrap gap-2', className)}>
      {items.map((item) => (
        <View key={item} className={cn(chipVariants({ variant }), chipClassName)}>
          <Text className={cn(chipTextVariants({ variant }))}>{item}</Text>
          {variant !== 'filter' && onRemove && (
            <Pressable onPress={() => onRemove(item)} accessibilityLabel={`Remove ${item}`}>
              <X className="text-icon-inverse" size={16} />
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}
