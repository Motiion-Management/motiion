import React from 'react';
import { useCallback } from 'react';
import { View } from 'react-native';

import { useFieldContext } from './context';

import { BottomSheetDatePicker } from '~/components/ui/bottom-sheet-date-picker';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';

export interface DatePickerFieldProps {
  label: string;
  placeholder?: string;
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
  placeholder,
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

  const handleBlur = useCallback(() => {
    field.handleBlur();
    if (validationModeContext) {
      validationModeContext.markFieldBlurred(field.name);
    }
  }, [field, validationModeContext]);

  return (
    <View className="flex-1">
      <BottomSheetDatePicker
        value={field.state.value}
        onChange={field.handleChange}
        onBlur={handleBlur}
        label={label}
        placeholder={placeholder}
        helpText={helpText}
        errorMessage={errorMessage}
        disabled={disabled}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        mode="date"
        formatDate={formatDate}
        formatTime={formatTime}
      />
    </View>
  );
};
