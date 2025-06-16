import React, { useState } from 'react';
import { View, Platform, Pressable } from 'react-native';
import { Icon } from '@roninoss/icons';

import { useFieldContext } from './context';

import { Button } from '~/components/nativewindui/Button';
import { DatePicker } from '~/components/nativewindui/DatePicker';
import { Text } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';

interface DateInputProps {
  label: string;
  minimumDate?: Date;
  maximumDate?: Date;
  helpText?: string;
}

export const DateInput = ({ label, minimumDate, maximumDate, helpText }: DateInputProps) => {
  const field = useFieldContext<Date>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View className="flex-1">
      {label && (
        <View className="mb-2">
          <Text variant="labelXs" className="uppercase text-text-disabled">
            {label}
          </Text>
        </View>
      )}
      <Pressable
        onPress={() => setShowDatePicker(true)}
        className={cn(
          'flex-row items-center justify-between rounded-full bg-surface-high px-4 py-4',
          field.state.meta.errors?.[0] && 'bg-surface-error'
        )}>
        <Text
          variant="bodyMd"
          className={cn(
            'text-text-default',
            field.state.meta.errors?.[0] && 'text-text-error',
            !field.state.value && 'text-text-default/40'
          )}>
          {field.state.value ? formatDate(field.state.value) : 'MM / DD / YYYY'}
        </Text>
        <Icon name="chevron-down" size={20} className="text-icon-default" />
      </Pressable>
      {showDatePicker && (
        <DatePicker
          value={field.state.value || new Date()}
          mode="date"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowDatePicker(false);
            }
            if (selectedDate) {
              field.handleChange(selectedDate);
              field.handleBlur();
            }
          }}
        />
      )}
      {(helpText || field.state.meta.errors?.[0]) && (
        <View className="mt-1 px-4">
          <Text
            variant="bodyXs"
            className={cn('text-text-disabled', field.state.meta.errors?.[0] && 'text-text-error')}>
            {field.state.meta.errors?.[0] || helpText}
          </Text>
        </View>
      )}
    </View>
  );
};
