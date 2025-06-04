import React, { useState } from 'react';
import { View, Platform } from 'react-native';

import { useFieldContext } from './context';

import { Button } from '~/components/nativewindui/Button';
import { DatePicker } from '~/components/nativewindui/DatePicker';
import { Text } from '~/components/nativewindui/Text';

interface DateInputProps {
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
  helpText?: string;
}

export const DateInput = ({ label, minimumDate, maximumDate, helpText }: DateInputProps) => {
  const field = useFieldContext<Date>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <View className="gap-2">
      <Text variant="labelXs" className="">
        {label}
      </Text>
      {(showDatePicker || Platform.OS === 'ios') && (
        <DatePicker
          value={field.state.value}
          mode="date"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowDatePicker(false);
            }
            if (selectedDate) {
              field.handleChange(selectedDate);
              field.handleBlur();
            }
          }}
        />
      )}
      {helpText && <Text className="text-sm text-muted-foreground">{helpText}</Text>}
      {field.state.meta.errors?.[0] && (
        <Text className="text-sm text-destructive">{field.state.meta.errors[0]}</Text>
      )}
    </View>
  );
};

