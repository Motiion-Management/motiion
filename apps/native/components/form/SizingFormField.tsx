import React, { forwardRef, useCallback } from 'react';
import { View, ViewProps } from 'react-native';

import { useFieldContext } from '~/components/form/context';
import { useSizingPicker } from '~/components/form/hooks/useSizingPicker';
import { SizingCard } from '~/components/ui/sizing-card';
import { SizingPickerSheet } from '~/components/ui/sizing-picker-sheet';
import { Text } from '~/components/ui/text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';
import { SizingMetricConfig } from '~/types/sizing';

export interface SizingFormFieldProps extends ViewProps {
  metric: SizingMetricConfig;
}

export const SizingFormField = forwardRef<View, SizingFormFieldProps>(
  ({ metric, className, ...props }, ref) => {
    const field = useFieldContext<string | undefined>();
    const validationModeContext = useValidationModeContextSafe();
    const { errorMessage } = useFieldError(field, { fieldName: field.name });
    const picker = useSizingPicker();

    const handleCardPress = useCallback(() => {
      picker.actions.present(metric, field.state.value);
    }, [picker.actions, metric, field.state.value]);

    const handleSave = useCallback(
      (value: string) => {
        field.handleChange(value);
        if (validationModeContext) {
          validationModeContext.markFieldBlurred(field.name);
        }
      },
      [field, validationModeContext]
    );

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

        <SizingPickerSheet
          isOpen={picker.models.isOpen}
          config={picker.models.config}
          selectedValue={picker.models.selectedValue}
          hasValueChanged={picker.models.hasValueChanged}
          onClose={picker.actions.dismiss}
          onValueChange={picker.actions.handleValueChange}
          onSave={handleSave}
        />
      </>
    );
  }
);

SizingFormField.displayName = 'SizingFormField';
