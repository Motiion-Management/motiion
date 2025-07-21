import React from 'react';
import { View } from 'react-native';

import { LocationPicker, LocationPickerProps } from './location-picker-placekit';
import XCircle from '~/lib/icons/XCircle';
import { Button } from './button';

export interface WorkLocationPickerProps extends LocationPickerProps {
  index: number;
  onRemove?: () => void;
}

export function WorkLocationPicker({ index, onRemove, ...rest }: WorkLocationPickerProps) {
  const label = `Location ${index + 1}`;
  const placeholder = index === 0 ? 'Primary work location...' : 'Additional work location...';

  // Create remove button for non-primary locations
  const removeButton =
    index > 0 && onRemove ? (
      <Button onPress={onRemove} size="iconInline" variant="primary">
        <XCircle className="text-text-high" />
      </Button>
    ) : undefined;

  return (
    <View style={{ zIndex: 1000 - index }}>
      <LocationPicker
        label={label}
        placeholder={placeholder}
        showHelperText={false}
        rightView={removeButton}
        {...rest}
      />
    </View>
  );
}
