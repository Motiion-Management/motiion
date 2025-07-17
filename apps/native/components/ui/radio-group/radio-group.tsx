import * as RadioGroupPrimitive from '@packages/primatives/components/radio-group';
import { useRadioGroupContext } from '@packages/primatives/components/radio-group';
import * as React from 'react';
import { View } from 'react-native';

import { SelectionCard } from '../selection-card';

import { cn } from '~/lib/utils';

const RadioGroup = React.forwardRef<RadioGroupPrimitive.RootRef, RadioGroupPrimitive.RootProps>(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root className={cn('gap-4 web:grid', className)} {...props} ref={ref} />
    );
  }
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<RadioGroupPrimitive.ItemRef, RadioGroupPrimitive.ItemProps>(
  ({ className, ...props }, ref) => {
    const { value } = useRadioGroupContext();
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          ' aspect-square h-4 w-4 items-center justify-center rounded-full border-2 border-border-default text-text-default web:ring-offset-background web:focus:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          props.value === value && 'border-border-high',
          props.disabled && 'opacity-50 web:cursor-not-allowed',
          className
        )}
        {...props}>
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <View className=" aspect-square h-2 w-2 rounded-full bg-border-high" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );
  }
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

const RadioGroupItemCard = React.forwardRef<
  RadioGroupPrimitive.ItemRef,
  {
    value: string;
    label: string;
    current?: string;
    description?: string;
  }
>(({ value, label, description }, ref) => {
  const { value: current, disabled, onValueChange } = useRadioGroupContext();

  const handleSelect = React.useCallback(
    (itemValue: string, selected: boolean) => {
      if (selected && onValueChange) {
        onValueChange(itemValue);
      }
    },
    [onValueChange]
  );

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      value={value}
      className="web:focus:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2">
      <SelectionCard
        variant="radio"
        value={value}
        label={label}
        description={description}
        selected={current === value}
        onSelect={handleSelect}
        disabled={disabled}
      />
    </RadioGroupPrimitive.Item>
  );
});

export { RadioGroup, RadioGroupItem, RadioGroupItemCard };
