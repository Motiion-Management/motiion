import React, { useCallback } from 'react'

import { useFieldContext } from './context'

import { BottomSheetPicker } from '~/components/ui/bottom-sheet-picker'
import { WheelPickerData } from '~/components/ui/wheel-picker'
import { useFieldError } from '~/hooks/useFieldError'
import { useValidationModeContextSafe } from '~/hooks/useValidationMode'

export interface BottomSheetPickerFieldProps<T = any> {
  label: string
  placeholder?: string
  data: WheelPickerData<T>[]
  formatValue?: (value: T) => string
  defaultValue?: T
  width?: number
  pickerLabel?: string
}

export function BottomSheetPickerField<T = any>({
  label,
  placeholder,
  data,
  formatValue,
  defaultValue,
  width,
  pickerLabel,
}: BottomSheetPickerFieldProps<T>) {
  const field = useFieldContext<T>()
  const validationModeContext = useValidationModeContextSafe()
  const { errorMessage } = useFieldError(field, {
    fieldName: field.name,
  })

  const handleBlur = useCallback(() => {
    field.handleBlur()
    if (validationModeContext) {
      validationModeContext.markFieldBlurred(field.name)
    }
  }, [field, validationModeContext])

  return (
    <BottomSheetPicker
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
    />
  )
}