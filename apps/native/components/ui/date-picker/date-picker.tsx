import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';

export function DatePicker({
  materialDateClassName,
  materialDateLabel,
  materialDateLabelClassName,
  materialTimeClassName,
  materialTimeLabel,
  materialTimeLabelClassName,
  ...props
}: React.ComponentProps<typeof DateTimePicker> & {
  mode: 'date' | 'time' | 'datetime';
} & {
  materialDateClassName?: string;
  materialDateLabel?: string;
  materialDateLabelClassName?: string;
  materialTimeClassName?: string;
  materialTimeLabel?: string;
  materialTimeLabelClassName?: string;
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && props.onChange) {
      props.onChange(event, selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && props.onChange) {
      props.onChange(event, selectedTime);
    }
  };

  return (
    <View className="flex-row gap-2.5">
      {props.mode.includes('date') && (
        <View className={cn('relative pt-1.5', materialDateClassName)}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="rounded border border-foreground/30 py-3 pl-2.5 active:opacity-80">
            <Text className="py-px">
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
              }).format(props.value)}
            </Text>
          </Pressable>
          <View
            className={cn(
              'absolute left-2 top-0 bg-surface-default px-1',
              materialDateLabelClassName
            )}>
            <Text variant="caption2" className="text-[10px] opacity-60">
              {materialDateLabel ?? 'Date'}
            </Text>
          </View>
          {showDatePicker && (
            <DateTimePicker
              {...props}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
        </View>
      )}
      {props.mode.includes('time') && (
        <View className={cn('relative pt-1.5', materialTimeClassName)}>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            className="rounded border border-foreground/30 py-3 pl-2.5 active:opacity-80">
            <Text className="py-px">
              {new Intl.DateTimeFormat('en-US', {
                timeStyle: 'short',
              }).format(props.value)}
            </Text>
          </Pressable>
          <View
            className={cn(
              'absolute left-2 top-0 bg-surface-default px-1',
              materialTimeLabelClassName
            )}>
            <Text variant="caption2" className="text-[10px] opacity-60">
              {materialTimeLabel ?? 'Time'}
            </Text>
          </View>
          {showTimePicker && (
            <DateTimePicker
              {...props}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
            />
          )}
        </View>
      )}
    </View>
  );
}
