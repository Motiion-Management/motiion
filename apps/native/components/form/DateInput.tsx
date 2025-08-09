import React from 'react';
import { View } from 'react-native';

import { useFieldContext } from './context';

import { DatePicker } from '~/components/ui/date-picker';
import { Text } from '~/components/ui/text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';
import { cn } from '~/lib/cn';
import { InputLabel } from '../ui/label';

export interface DateInputProps {
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
  helpText?: string;
  // Optional custom display formatters
  formatDate?: (date: Date) => string;
  formatTime?: (date: Date) => string;
}

export const DateInput = ({
  label,
  minimumDate,
  maximumDate,
  helpText,
  formatDate,
  formatTime,
}: DateInputProps) => {
  const field = useFieldContext<Date>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, {
    fieldName: field.name,
  });

  return (
    <View className="flex-1">
      {label && (
        <View className="mb-2">
          <InputLabel>{label}</InputLabel>
        </View>
      )}

      <DatePicker
        value={field.state.value || new Date()}
        mode="date"
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        formatDate={formatDate}
        formatTime={formatTime}
        onChange={(event, selectedDate) => {
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
