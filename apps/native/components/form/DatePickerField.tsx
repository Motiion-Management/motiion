import React from 'react';
import { View } from 'react-native';

import { useFieldContext } from './context';

import { DatePicker } from '~/components/ui/date-picker';
import { Text } from '~/components/ui/text';
import { ErrorText } from '~/components/ui/error-text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';
import { cn } from '~/lib/cn';
import { InputLabel } from '~/components/ui/label';

export interface DatePickerFieldProps {
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
  helpText?: string;
  disabled?: boolean;
  // Optional custom display formatters
  formatDate?: (date: Date) => string;
  formatTime?: (date: Date) => string;
}

export const DatePickerField = ({
  label,
  minimumDate,
  maximumDate,
  helpText,
  disabled,
  formatDate,
  formatTime,
}: DatePickerFieldProps) => {
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
        disabled={disabled}
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
      {helpText && (
        <View className="mt-1 px-4">
          <Text variant="bodyXs" className="text-text-disabled">
            {helpText}
          </Text>
        </View>
      )}
      <ErrorText>{errorMessage}</ErrorText>
    </View>
  );
};
