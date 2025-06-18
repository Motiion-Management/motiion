import * as RadioGroupPrimitive from '@rn-primitives/radio-group';
import * as React from 'react';
import { View } from 'react-native';

import { cn } from '~/lib/utils';

const RadioGroup = React.forwardRef<RadioGroupPrimitive.RootRef, RadioGroupPrimitive.RootProps>(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root className={cn('gap-2 web:grid', className)} {...props} ref={ref} />
    );
  }
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<RadioGroupPrimitive.ItemRef, RadioGroupPrimitive.ItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          'native:h-5 native:w-5 aspect-square h-4 w-4 items-center justify-center rounded-full border border-primary text-text-default web:ring-offset-background web:focus:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          props.disabled && 'opacity-50 web:cursor-not-allowed',
          className
        )}
        {...props}>
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <View className="native:h-[10] native:w-[10] aspect-square h-[9px] w-[9px] rounded-full bg-primary-500" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );
  }
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
