import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';

import { WheelPicker } from '~/components/ui/wheel-picker';

export interface HeightValue {
  feet: number;
  inches: number;
}

interface HeightPickerProps {
  value?: HeightValue;
  onChange?: (value: HeightValue) => void;
  defaultValue?: HeightValue;
}

// Generate feet options (3-7 feet)
const feetData = Array.from({ length: 5 }, (_, i) => ({
  value: i + 3,
  label: (i + 3).toString(),
}));

// Generate inches options (0-11 inches)
const inchesData = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: i.toString(),
}));

export function HeightPicker({
  value,
  onChange,
  defaultValue = { feet: 5, inches: 6 },
}: HeightPickerProps) {
  const [currentValue, setCurrentValue] = useState<HeightValue>(value || defaultValue);

  useEffect(() => {
    if (value) {
      setCurrentValue(value);
    }
  }, [value]);

  const handleFeetChange = useCallback(
    (feet: number) => {
      const newValue = { ...currentValue, feet };
      setCurrentValue(newValue);
      onChange?.(newValue);
    },
    [currentValue, onChange]
  );

  const handleInchesChange = useCallback(
    (inches: number) => {
      const newValue = { ...currentValue, inches };
      setCurrentValue(newValue);
      onChange?.(newValue);
    },
    [currentValue, onChange]
  );

  return (
    <View className="overflow-hidden rounded-lg border border-border-low">
      <View className="relative h-[178px]">
        {/* Highlight region - this provides the background for selected items */}
        <View className="absolute left-0 right-0 top-1/2 h-14 -translate-y-1/2 border-b border-t border-border-accent bg-surface-high" />

        {/* Picker columns */}
        <View className="mr-10 h-full flex-row items-center justify-center">
          <WheelPicker
            width={116}
            data={feetData}
            value={currentValue.feet}
            onValueChange={handleFeetChange}
            label="feet"
          />

          <WheelPicker
            width={124}
            data={inchesData}
            value={currentValue.inches}
            onValueChange={handleInchesChange}
            label="inches"
          />
        </View>
      </View>
    </View>
  );
}
