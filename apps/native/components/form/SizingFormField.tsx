import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback } from 'react';
import { View, ViewProps } from 'react-native';

import { useSheetRef } from '../ui/sheet';

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
    const sheetRef = useSheetRef();

    const handleCardPress = useCallback(() => {
      console.log('Opening sizing picker for:', metric.field);
      sheetRef.current?.present();
    }, [metric.field]);

    const handleSave = useCallback(
      (value: string) => {
        field.handleChange(value);
        if (validationModeContext) {
          validationModeContext.markFieldBlurred(field.name);
        }
        sheetRef.current?.dismiss();
      },
      [field, validationModeContext]
    );

    const handleClose = useCallback(() => {
      sheetRef.current?.dismiss();
    }, []);

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
          ref={sheetRef}
          metric={metric}
          initialValue={field.state.value}
          onClose={handleClose}
          onSave={handleSave}
        />
      </>
    );
  }
);

SizingFormField.displayName = 'SizingFormField';
