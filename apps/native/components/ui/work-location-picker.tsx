import React from 'react';
import { View } from 'react-native';

import { LocationPicker, LocationPickerProps } from './location-picker-placekit';

export interface WorkLocationPickerProps extends LocationPickerProps {
  index: number;
  onRemove?: () => void;
}

export function WorkLocationPicker({ index, onRemove, ...rest }: WorkLocationPickerProps) {
  const label = `Location ${index + 1}`;
  const placeholder = index === 0 ? 'Primary work location...' : 'Additional work location...';

  const additionalLocationProps: Partial =
    index > 0
      ? {
          clearButtonMode: 'always',
          onClear: onRemove,
        }
      : {};

  return (
    <View style={{ zIndex: 1000 - index }}>
      <LocationPicker
        label={label}
        placeholder={placeholder}
        showHelperText={false}
        {...additionalLocationProps}
        {...rest}
      />
    </View>
  );
}
