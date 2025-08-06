import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Input } from '~/components/ui/input';
import { Sheet, useSheetState } from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import Search from '~/lib/icons/Search';
import { cn } from '~/lib/cn';

export interface ComboboxItem<T = any> {
  value: T;
  label: string;
}

export interface BottomSheetPickerProps<T = any> {
  value?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  data: ComboboxItem<T>[];
  label?: string;
  placeholder?: string;
  formatValue?: (value: T) => string;
  defaultValue?: T;
  width?: number;
  pickerLabel?: string;
  errorMessage?: string;
  disabled?: boolean;
}

export function BottomSheetCombobox<T = any>({
  value,
  onChange,
  onBlur,
  data,
  label,
  placeholder,
  formatValue,
  defaultValue,
  errorMessage,
  disabled,
}: BottomSheetPickerProps<T>) {
  const sheetState = useSheetState();
  const [tempValue, setTempValue] = useState<T>(value || defaultValue || data?.[0]?.value);

  const handleSave = useCallback(() => {
    onChange?.(tempValue);
    sheetState.close();
  }, [tempValue, onChange, sheetState]);

  const handleSheetOpen = useCallback(() => {
    if (disabled) return;
    setTempValue(value || defaultValue || data?.[0]?.value);
    sheetState.open();
  }, [value, defaultValue, data, sheetState, disabled]);

  const handleClose = useCallback(() => {
    sheetState.close();
  }, [sheetState]);

  const displayValue = useMemo(() => {
    console.log('displayValue', { value, data, formatValue });
    if (!value) return '';

    if (formatValue) {
      return formatValue(value);
    }

    const selectedItem = data.find((item) => item.value === value);
    return selectedItem?.label || '';
  }, [value, data, formatValue]);

  const renderSearchItem = ({ item }: { item: ComboboxItem<T> }) => {
    return (
      <Pressable onPress={() => setTempValue(item.value)}>
        <Text
          className={cn('p-4', data[0] !== item && 'border-t border-t-border')}
          variant="bodyLg">
          {item.label}
        </Text>
      </Pressable>
    );
  };
  return (
    <>
      <Pressable onPress={handleSheetOpen} disabled={disabled}>
        <Input
          readOnly
          label={label}
          placeholder={placeholder}
          value={displayValue}
          onBlur={onBlur}
          errorMessage={errorMessage}
          rightView={
            <Search className="pointer-events-none text-text-default opacity-50" size={20} />
          }
        />
      </Pressable>

      <Sheet
        isOpened={sheetState.isOpen}
        stackBehavior="push"
        label={label}
        onIsOpenedChange={(isOpen) => {
          if (!isOpen) {
            sheetState.close();
          }
        }}>
        <View className="h-[82vh] px-4">
          <View className="flex-1">
            <Input
              autoFocus
              label={label}
              placeholder={placeholder}
              value={displayValue}
              onBlur={onBlur}
              errorMessage={errorMessage}
              rightView={
                <Search className="pointer-events-none text-text-default opacity-50" size={20} />
              }
            />
            <FlatList data={data} renderItem={renderSearchItem} />
          </View>

          <Button onPress={handleSave} className="w-full">
            <Text>Save</Text>
          </Button>
        </View>
      </Sheet>
    </>
  );
}
