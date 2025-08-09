import React, { useCallback } from 'react';

import { useFieldContext } from './context';

import { BottomSheetCombobox, ComboboxItem } from '~/components/ui/bottom-sheet-combobox';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';

export interface BottomSheetComboboxFieldProps<T = any> {
  label: string;
  placeholder?: string;
  data: ComboboxItem<T>[];
  formatValue?: (value: T) => string;
  defaultValue?: T;
  width?: number;
  pickerLabel?: string;
  disabled?: boolean;
  onSearch?: (searchTerm: string, data: ComboboxItem<T>[]) => ComboboxItem<T>[];
  onSearchAsync?: (searchTerm: string) => Promise<ComboboxItem<T>[]>;
  getLabelAsync?: (value: T) => Promise<ComboboxItem<T> | string | undefined | null>;
}

export function BottomSheetComboboxField<T = any>({
  label,
  placeholder,
  data,
  formatValue,
  defaultValue,
  width,
  pickerLabel,
  disabled,
  onSearch,
  onSearchAsync,
  getLabelAsync,
}: BottomSheetComboboxFieldProps<T>) {
  const field = useFieldContext<T>();
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
    <BottomSheetCombobox
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={handleBlur}
      data={data}
      label={label}
      placeholder={placeholder}
      formatValue={formatValue}
      defaultValue={defaultValue}
      width={width}
      pickerLabel={pickerLabel}
      errorMessage={errorMessage}
      disabled={disabled}
      onSearch={onSearch}
      onSearchAsync={onSearchAsync}
      getLabelAsync={getLabelAsync}
    />
  );
}
