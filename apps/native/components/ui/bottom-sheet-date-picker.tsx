import React, { useCallback, useMemo, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { DatePicker } from '~/components/ui/date-picker';

import { Input } from '~/components/ui/input';
import { Sheet, useSheetState } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import Calendar from '~/lib/icons/Calendar';

export interface BottomSheetDatePickerProps {
  value?: Date;
  onChange?: (value: Date) => void;
  onBlur?: () => void;
  label?: string;
  placeholder?: string;
  helpText?: string;
  errorMessage?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  formatDate?: (date: Date) => string;
  formatTime?: (date: Date) => string;
}

export function BottomSheetDatePicker({
  value,
  onChange,
  onBlur,
  label,
  placeholder,
  helpText,
  errorMessage,
  disabled,
  minimumDate,
  maximumDate,
  mode = 'date',
  formatDate,
  formatTime,
}: BottomSheetDatePickerProps) {
  const sheetState = useSheetState();
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const displayValue = useMemo(() => {
    if (!value) return '';
    if (mode === 'time') {
      return formatTime
        ? formatTime(value)
        : new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(value);
    }
    // date or datetime
    const dateStr = formatDate
      ? formatDate(value)
      : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(value);
    if (mode === 'datetime') {
      const timeStr = formatTime
        ? formatTime(value)
        : new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(value);
      return `${dateStr} ${timeStr}`;
    }
    return dateStr;
  }, [value, mode, formatDate, formatTime]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    Keyboard.dismiss();
    setTempDate(value || new Date());
    sheetState.open();
  }, [disabled, sheetState, value]);

  const handleSave = useCallback(() => {
    onChange?.(tempDate);
    onBlur?.();
    sheetState.close();
  }, [onChange, onBlur, tempDate, sheetState]);

  return (
    <>
      <Pressable onPress={handleOpen} disabled={disabled}>
        <Input
          readOnly
          label={label}
          placeholder={placeholder}
          value={displayValue}
          errorMessage={errorMessage}
          rightView={<Calendar size={20} className="text-icon-default" />}
        />
      </Pressable>

      <Sheet
        isOpened={sheetState.isOpen}
        stackBehavior="push"
        label={label}
        onIsOpenedChange={(isOpen) => {
          if (!isOpen) sheetState.close();
        }}>
        <View className="gap-4 px-4 pb-4">
          <View className="items-start justify-center px-4">
            <View
              className="mb-4 scale-[1.2] items-center justify-center"
              onLayout={() => {
                /* allow dynamic sheet sizing */
              }}>
              <DatePicker
                value={tempDate}
                mode={mode as any}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={(event, date) => {
                  if (date) setTempDate(date);
                }}
              />
            </View>
          </View>

          {helpText && (
            <Text variant="bodyXs" className="mb-2 px-1 text-text-disabled">
              {helpText}
            </Text>
          )}

          <Button onPress={handleSave} className="mt-2 w-full">
            <Text>Save</Text>
          </Button>
        </View>
      </Sheet>
    </>
  );
}
