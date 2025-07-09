import WheelPicker from '@quidone/react-native-wheel-picker';
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback';
import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';

import { Text } from '~/components/ui/text';

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

interface CustomWheelPickerProps {
  data: { value: number; label: string }[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  label: string;
  width?: number;
}

function CustomWheelPicker({
  data,
  selectedValue,
  onValueChange,
  label,
  width = 100,
}: CustomWheelPickerProps) {
  return (
    <View className="items-center">
      <WheelPicker
        data={data}
        value={selectedValue}
        onValueChanged={({ item: { value } }) => onValueChange(value)}
        onValueChanging={() => {
          WheelPickerFeedback.triggerSoundAndImpact();
        }}
        width={width}
        itemTextStyle={{
          fontSize: 24,
          fontWeight: 600,
          color: 'white',
        }}
      />

      {/* Label positioned to the right of the selected value */}
      <View className="absolute left-2/3 top-1/2  -translate-y-1/2">
        <Text className="text-lg font-normal text-text-default">{label}</Text>
      </View>
    </View>
  );
}

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
    <View className="overflow-hidden rounded-lg border border-border-default ">
      <View className="relative h-[178px]">
        {/* Highlight region - this provides the background for selected items */}
        <View className="absolute left-0 right-0 top-1/2 h-14 -translate-y-1/2 border-b border-t border-border-accent bg-surface-high" />

        {/* Picker columns */}
        <View className="mr-10 h-full flex-row items-center justify-center">
          <View className="items-center">
            <CustomWheelPicker
              width={116}
              data={feetData}
              selectedValue={currentValue.feet}
              onValueChange={handleFeetChange}
              label="feet"
            />
          </View>

          <View className="items-center ">
            <CustomWheelPicker
              width={124}
              data={inchesData}
              selectedValue={currentValue.inches}
              onValueChange={handleInchesChange}
              label="inches"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
