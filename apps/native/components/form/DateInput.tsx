import { Icon } from '@roninoss/icons';
import React, { useState } from 'react';
import { View, Platform, Pressable } from 'react-native';

import { useFieldContext } from './context';

import { Button } from '~/components/ui/button';
import { DatePicker } from '~/components/ui/date-picker';
import { Text } from '~/components/ui/text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';
import { cn } from '~/lib/cn';

interface DateInputProps {
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
  helpText?: string;
}

export const DateInput = ({ label, minimumDate, maximumDate, helpText }: DateInputProps) => {
  const field = useFieldContext<Date>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, {
    fieldName: field.name,
  });

  return (
    <View className="flex-1">
      {label && (
        <View className="mb-2">
          <Text variant="labelXs" className="uppercase text-text-disabled">
            {label}
          </Text>
        </View>
      )}

      <DatePicker
        value={field.state.value || new Date()}
        mode="date"
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        onChange={(event, selectedDate) => {
          // if (Platform.OS === 'android') {
          //   setShowDatePicker(false);
          // }
          if (selectedDate) {
            field.handleChange(selectedDate);
            field.handleBlur();
            // Mark field as blurred in validation mode
            if (validationModeContext) {
              validationModeContext.markFieldBlurred(field.name);
            }
          }
        }}
      />
      {(helpText || errorMessage) && (
        <View className="mt-1 px-4">
          <Text
            variant="bodyXs"
            className={cn('text-text-disabled', errorMessage && 'text-text-error')}>
            {errorMessage || helpText}
          </Text>
        </View>
      )}
    </View>
  );
};
