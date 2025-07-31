import React from 'react';
import { View } from 'react-native';
import { Picker, PickerItem } from '~/components/ui/select';

interface HeightFieldV3Props {
  value?: any;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HeightFieldV3({ value, onChange, placeholder }: HeightFieldV3Props) {
  // Convert object format to string format if needed
  const getCurrentValue = () => {
    if (!value) return '';

    // If it's already a string, return it
    if (typeof value === 'string') return value;

    // If it's an object with feet and inches, convert it
    if (value.feet !== undefined && value.inches !== undefined) {
      return `${value.feet}-${value.inches}`;
    }

    return '';
  };

  const options = [
    { value: '4-0', label: '4\'0"' },
    { value: '4-1', label: '4\'1"' },
    { value: '4-2', label: '4\'2"' },
    { value: '4-3', label: '4\'3"' },
    { value: '4-4', label: '4\'4"' },
    { value: '4-5', label: '4\'5"' },
    { value: '4-6', label: '4\'6"' },
    { value: '4-7', label: '4\'7"' },
    { value: '4-8', label: '4\'8"' },
    { value: '4-9', label: '4\'9"' },
    { value: '4-10', label: '4\'10"' },
    { value: '4-11', label: '4\'11"' },
    { value: '5-0', label: '5\'0"' },
    { value: '5-1', label: '5\'1"' },
    { value: '5-2', label: '5\'2"' },
    { value: '5-3', label: '5\'3"' },
    { value: '5-4', label: '5\'4"' },
    { value: '5-5', label: '5\'5"' },
    { value: '5-6', label: '5\'6"' },
    { value: '5-7', label: '5\'7"' },
    { value: '5-8', label: '5\'8"' },
    { value: '5-9', label: '5\'9"' },
    { value: '5-10', label: '5\'10"' },
    { value: '5-11', label: '5\'11"' },
    { value: '6-0', label: '6\'0"' },
    { value: '6-1', label: '6\'1"' },
    { value: '6-2', label: '6\'2"' },
    { value: '6-3', label: '6\'3"' },
    { value: '6-4', label: '6\'4"' },
    { value: '6-5', label: '6\'5"' },
    { value: '6-6', label: '6\'6"' },
  ];

  return (
    <Picker selectedValue={getCurrentValue()} onValueChange={onChange}>
      <PickerItem label={placeholder || 'Select your height'} value="" />
      {options.map((option) => (
        <PickerItem key={option.value} label={option.label} value={option.value} />
      ))}
    </Picker>
  );
}
