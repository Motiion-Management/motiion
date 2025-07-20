import React, { forwardRef, useCallback } from 'react';
import { View, ViewProps } from 'react-native';

import { useSheetState } from '../ui/sheet';

import { useFieldContext } from '~/components/form/context';
import { SizingCard } from '~/components/ui/sizing-card';
import { SizingPickerSheet } from '~/components/ui/sizing-picker-sheet';
import { Text } from '~/components/ui/text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';
import { cn } from '~/lib/cn';
import { SizingMetricConfig } from '~/types/sizing';

export interface SizingFormFieldProps extends ViewProps {
  metric: SizingMetricConfig;
}

export const SizingFormField = forwardRef<View, SizingFormFieldProps>(
  ({ metric, className, ...props }, ref) => {
    const field = useFieldContext<string | undefined>();
    const validationModeContext = useValidationModeContextSafe();
    const { errorMessage } = useFieldError(field, { fieldName: field.name });
    const { isOpen, open, close } = useSheetState();

    const handleCardPress = () => {
      console.log('Opening sizing picker for:', metric.field);
      open();
    };

    const handleSave = useCallback(
      (value: string) => {
        field.handleChange(value);
        if (validationModeContext) {
          validationModeContext.markFieldBlurred(field.name);
        }
      },
      [field, validationModeContext]
    );

    const handleOpenChange = useCallback(
      (isOpen: boolean) => {
        if (!isOpen) {
          close();
        }
      },
      [close]
    );

    return (
      <>
        <View ref={ref} className={cn('w-[118px]', className)} {...props}>
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
          metric={metric}
          initialValue={field.state.value}
          isOpen={isOpen}
          onOpenChange={handleOpenChange}
          onSave={handleSave}
        />
      </>
    );
  }
);

SizingFormField.displayName = 'SizingFormField';
