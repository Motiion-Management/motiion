import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Checkbox } from '~/components/ui/checkbox';
import { RadioGroupItem } from '~/components/ui/radio-group';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

export interface SelectionCardProps {
  variant: 'checkbox' | 'radio';
  value: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: (value: string, selected: boolean) => void;
  disabled?: boolean;
}

const SelectionCard = React.forwardRef<React.ElementRef<typeof Pressable>, SelectionCardProps>(
  ({ variant, value, label, description, selected, onSelect, disabled }, ref) => {
    const handlePress = () => {
      if (!disabled) {
        onSelect(value, !selected);
      }
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        className={cn(
          'rounded-full border border-border-default bg-surface-high px-6 py-3',
          selected && 'border-2 border-border-accent bg-surface-accent',
          disabled && 'opacity-50 web:cursor-not-allowed'
        )}>
        <View className={cn('flex-row items-center gap-3 p-px', selected && 'p-0')}>
          <View className="flex-1">
            <Text variant="body">{label}</Text>
            {description && (
              <Text variant="bodySm" className="text-text-secondary mt-1">
                {description}
              </Text>
            )}
          </View>
          {variant === 'checkbox' && (
            <Checkbox
              checked={selected}
              onCheckedChange={() => handlePress()}
              disabled={disabled}
            />
          )}
          {variant === 'radio' && <RadioGroupItem value={value} />}
        </View>
      </Pressable>
    );
  }
);

SelectionCard.displayName = 'SelectionCard';

export { SelectionCard };
