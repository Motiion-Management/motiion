import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View } from 'react-native';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Text } from '~/components/ui/text';
import type { FormHandle, FormProps } from './contracts';

export const databaseUseSchema = z.object({
  databaseUse: z.enum(['casting', 'booking', 'production', 'other']),
});

type DatabaseUseFormValues = z.infer<typeof databaseUseSchema>;

export const DatabaseUseForm = forwardRef<FormHandle, FormProps<DatabaseUseFormValues>>(
  ({ initialValues, onSubmit, onValidChange }, ref) => {
    const [databaseUse, setDatabaseUse] = useState<string>(initialValues?.databaseUse || '');

    useEffect(() => {
      const isValid = !!databaseUse;
      onValidChange?.(isValid);
    }, [databaseUse, onValidChange]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const values = { databaseUse: databaseUse as any };
        await onSubmit(values);
      },
      isDirty: () => databaseUse !== (initialValues?.databaseUse || ''),
      isValid: () => !!databaseUse,
    }));

    return (
      <View className="flex-1">
        <RadioGroup value={databaseUse} onValueChange={setDatabaseUse}>
          <RadioGroupItem value="casting" className="mb-3">
            <Text className="text-text-default">Casting</Text>
          </RadioGroupItem>
          <RadioGroupItem value="booking" className="mb-3">
            <Text className="text-text-default">Booking</Text>
          </RadioGroupItem>
          <RadioGroupItem value="production" className="mb-3">
            <Text className="text-text-default">Production</Text>
          </RadioGroupItem>
          <RadioGroupItem value="other" className="mb-3">
            <Text className="text-text-default">Other</Text>
          </RadioGroupItem>
        </RadioGroup>
      </View>
    );
  }
);

DatabaseUseForm.displayName = 'DatabaseUseForm';
