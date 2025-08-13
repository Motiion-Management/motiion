import React, { useMemo } from 'react';

import { BottomSheetPickerField } from './BottomSheetPickerField';
import { WheelPickerData } from '~/components/ui/wheel-picker';

interface YearPickerFieldProps {
  label: string;
  placeholder?: string;
  startYear?: number;
  endYear?: number;
  helpText?: string;
  disabled?: boolean;
}

export function YearPickerField({
  label,
  placeholder = 'Select year',
  startYear = 1900,
  endYear = new Date().getFullYear(),
  helpText,
  disabled,
}: YearPickerFieldProps) {
  const yearData: WheelPickerData<number>[] = useMemo(() => {
    // Normalize bounds so callers can pass years in any order
    const min = Math.min(startYear, endYear);
    const max = Math.max(startYear, endYear);

    const years: WheelPickerData<number>[] = [];
    for (let year = max; year >= min; year--) {
      years.push({
        label: year.toString(),
        value: year,
      });
    }
    return years;
  }, [startYear, endYear]);

  return (
    <BottomSheetPickerField
      label={label}
      placeholder={placeholder}
      data={yearData}
      formatValue={(value) => value?.toString() ?? ''}
      pickerLabel={label}
      helpText={helpText}
      disabled={disabled}
    />
  );
}
