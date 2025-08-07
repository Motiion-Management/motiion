import React, { useState, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { Input } from '~/components/ui/input';
import { Sheet, useSheetState } from '~/components/ui/sheet';
import { WheelPicker, WheelPickerData } from '~/components/ui/wheel-picker';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import ChevronDown from '~/lib/icons/ChevronDown';
import X from '~/lib/icons/X';

export interface BottomSheetPickerProps<T = any> {
  value?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  data: WheelPickerData<T>[];
  label?: string;
  placeholder?: string;
  formatValue?: (value: T) => string;
  defaultValue?: T;
  width?: number;
  pickerLabel?: string;
  errorMessage?: string;
  disabled?: boolean;
}

export function BottomSheetPicker<T = any>({
  value,
  onChange,
  onBlur,
  data,
  label,
  placeholder,
  formatValue,
  defaultValue,
  width,
  pickerLabel,
  errorMessage,
  disabled,
}: BottomSheetPickerProps<T>) {
  const sheetState = useSheetState();
  const [tempValue, setTempValue] = useState<T>(value || defaultValue || data[0]?.value);

  const handleSave = useCallback(() => {
    onChange?.(tempValue);
    sheetState.close();
  }, [tempValue, onChange, sheetState]);

  const handleSheetOpen = useCallback(() => {
    if (disabled) return;
    setTempValue(value || defaultValue || data[0]?.value);
    sheetState.open();
  }, [value, defaultValue, data, sheetState, disabled]);

  const displayValue = useMemo(() => {
    if (!value) return '';

    if (formatValue) {
      return formatValue(value);
    }

    const selectedItem = data.find((item) => item.value === value);
    return selectedItem?.label || '';
  }, [value, data, formatValue]);

  return (
    <>
      <Pressable onPress={handleSheetOpen} disabled={disabled}>
        <Input
          label={label}
          placeholder={placeholder}
          value={displayValue}
          readOnly={true}
          onBlur={onBlur}
          errorMessage={errorMessage}
          rightView={
            <ChevronDown className="pointer-events-none text-text-default opacity-50" size={20} />
          }
        />
      </Pressable>

      <Sheet
        isOpened={sheetState.isOpen}
        label={label}
        stackBehavior="push"
        onIsOpenedChange={(isOpen) => {
          if (!isOpen) {
            sheetState.close();
          }
        }}>
        <View className="px-4">
          <View className="mb-6 overflow-hidden rounded-lg border border-border-low">
            <View className="relative h-[178px]">
              {/* Highlight region */}
              <View className="absolute left-0 right-0 top-1/2 h-14 -translate-y-1/2 border-b border-t border-border-accent bg-surface-high" />

              {/* Picker */}
              <View className="h-full items-center justify-center">
                <WheelPicker
                  data={data}
                  value={tempValue}
                  onValueChange={setTempValue}
                  label={pickerLabel}
                  width={width}
                  itemTextClassName="text-h4"
                />
              </View>
            </View>
          </View>

          <Button onPress={handleSave} className="w-full">
            <Text>Save</Text>
          </Button>
        </View>
      </Sheet>
    </>
  );
}
