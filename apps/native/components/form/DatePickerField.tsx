import React from 'react';
import { useCallback, useMemo } from 'react';
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
  // Store Date objects in the form state for consistent typing.
  const field = useFieldContext<any>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, {
    fieldName: field.name,
  });

  // Parse stored legacy string/ISO into a local Date (avoid UTC off-by-one)
  const parseToDate = (value?: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? undefined : d;
    }
    if (typeof value === 'string') {
      const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (ymd) {
        const year = Number(ymd[1]);
        const month = Number(ymd[2]) - 1;
        const day = Number(ymd[3]);
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? undefined : d;
      }
      const d = new Date(value);
      return isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
  };

  const handleBlur = useCallback(() => {
    field.handleBlur();
    if (validationModeContext) {
      validationModeContext.markFieldBlurred(field.name);
    }
  }, [field, validationModeContext]);

  // Convert stored value into a Date for the picker UI
  const dateValue = useMemo(() => parseToDate(field.state.value), [field.state.value]);

  return (
    <View className="flex-1">
      <BottomSheetDatePicker
        value={dateValue}
        onChange={(d) => {
          if (!d) return;
          // Normalize by always storing Date objects in the form
          field.handleChange(d as any);
        }}
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
