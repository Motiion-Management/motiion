import React, { forwardRef, useRef, useCallback } from 'react'
import { View, ViewProps } from 'react-native'

import { useFieldContext } from '~/components/form/context'
import { useFieldError } from '~/hooks/useFieldError'
import { useValidationModeContextSafe } from '~/hooks/useValidationMode'
import { SizingCard } from '~/components/sizing/SizingCard'
import { SizingPickerSheet, SizingPickerSheetRef } from '~/components/sizing/SizingPickerSheet'
import { Text } from '~/components/ui/text'
import { SizingMetricConfig } from '~/types/sizing'

interface SizingFormFieldProps extends ViewProps {
  metric: SizingMetricConfig
}

export const SizingFormField = forwardRef<View, SizingFormFieldProps>(
  ({ metric, className, ...props }, ref) => {
    const field = useFieldContext<string | undefined>()
    const validationModeContext = useValidationModeContextSafe()
    const { errorMessage } = useFieldError(field, { fieldName: field.name })
    const pickerRef = useRef<SizingPickerSheetRef>(null)

    const handleCardPress = useCallback(() => {
      if (pickerRef.current) {
        pickerRef.current.present(metric, field.state.value)
      }
    }, [metric, field.state.value])

    const handleSave = useCallback(
      (value: string) => {
        field.handleChange(value)
        if (validationModeContext) {
          validationModeContext.markFieldBlurred(field.name)
        }
      },
      [field, validationModeContext]
    )

    return (
      <>
        <View ref={ref} className={className} {...props}>
          <SizingCard
            label={metric.label}
            value={field.state.value}
            unit={metric.unit}
            onPress={handleCardPress}
          />
          
          {errorMessage && (
            <Text variant="bodySm" className="mt-2 text-text-error">
              {errorMessage}
            </Text>
          )}
        </View>
        
        <SizingPickerSheet ref={pickerRef} onSave={handleSave} />
      </>
    )
  }
)

SizingFormField.displayName = 'SizingFormField'