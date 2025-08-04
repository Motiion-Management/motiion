import BaseWheelPicker from '@quidone/react-native-wheel-picker';
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback';
import { cssInterop } from 'nativewind';
import React from 'react';
import { View } from 'react-native';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';

// Configure NativeWind cssInterop for the base wheel picker
const InteropWheelPicker = cssInterop(BaseWheelPicker, {
  className: 'style',
  itemTextClassName: 'itemTextStyle',
  overlayItemClassName: 'overlayItemStyle',
  contentContainerClassName: 'contentContainerStyle',
});

export interface WheelPickerData<T = any> {
  value: T;
  label: string;
}

export interface WheelPickerProps<T = any> extends Omit {
  data: WheelPickerData[];
  value: T;
  onValueChange: (value: T) => void;
  label?: string;
  labelClassName?: string;
  enableFeedback?: boolean;
  width?: number;
}

export function WheelPicker<T = any>({
  data,
  value,
  onValueChange,
  label,
  labelClassName,
  enableFeedback = true,
  className,
  itemTextClassName,
  overlayItemClassName,
  contentContainerClassName,
  width,
  ...props
}: WheelPickerProps) {
  const handleValueChange = (event: { item: { value: T; label?: string } }) => {
    onValueChange(event.item.value);
  };

  const handleValueChanging = () => {
    if (enableFeedback) {
      WheelPickerFeedback.triggerSoundAndImpact();
    }
  };

  return (
    <View className="relative items-center">
      <InteropWheelPicker
        data={data}
        value={value}
        onValueChanged={handleValueChange}
        onValueChanging={handleValueChanging}
        className={cn('h-full', className)}
        overlayItemClassName={cn('bg-transparent', overlayItemClassName)}
        contentContainerClassName={cn('', contentContainerClassName)}
        renderItem={({ item }) => (
          <View className="flex-1 items-center justify-center">
            <Text variant="header3" className="text-center text-text-default">
              {item.label}
            </Text>
          </View>
        )}
        width={width}
        {...props}
      />

      {label && (
        <View className="absolute left-2/3 top-1/2 -translate-y-1/2">
          <Text variant="bodyLg" className={cn('text-text-default', labelClassName)}>
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}
