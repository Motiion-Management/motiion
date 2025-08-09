import React, { useState, useCallback, useMemo, useRef } from 'react';
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
  onSearch?: (searchTerm: string, data: ComboboxItem<T>[]) => ComboboxItem<T>[];
  onSearchAsync?: (searchTerm: string) => Promise<ComboboxItem<T>[]>;
  getLabelAsync?: (value: T) => Promise<ComboboxItem<T> | string | undefined | null>;
}

export function BottomSheetCombobox<T = any>({
  value,
  onChange,
  onBlur,
  data = [],
  label,
  placeholder,
  formatValue,
  defaultValue,
  errorMessage,
  disabled,
  onSearch,
  onSearchAsync,
  getLabelAsync,
}: BottomSheetPickerProps<T>) {
  const sheetState = useSheetState();
  const searchInputRef = useRef<any>(null);
  const [tempValue, setTempValue] = useState<T>(value || defaultValue || data?.[0]?.value);
  const [searchTerm, setSearchTerm] = useState('');
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<T | undefined>(value || defaultValue);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);

  const handleSave = useCallback(() => {
    setInternalValue(tempValue);
    // Determine label for saved value for display when data is empty
    const source = onSearchAsync ? asyncResults : data;
    const item = source?.find((it) => it.value === tempValue);
    const lbl = item?.label ?? (formatValue ? formatValue(tempValue as T) : undefined);
    setSelectedLabel(lbl);
    onChange?.(tempValue);
    sheetState.close();
  }, [tempValue, onChange, sheetState, onSearchAsync, asyncResults, data, formatValue]);

  const handleSheetOpen = useCallback(() => {
    if (disabled) return;
    // Use prop value if provided, otherwise use internal state
    const currentValue = value !== undefined ? value : internalValue;
    setTempValue(currentValue || defaultValue || data?.[0]?.value);
    setSearchTerm('');
    sheetState.open();
  }, [value, internalValue, defaultValue, data, sheetState, disabled]);

  const handleClose = useCallback(() => {
    sheetState.close();
  }, [sheetState]);

  const [asyncResults, setAsyncResults] = useState<ComboboxItem<T>[]>(data || []);

  const displayValue = useMemo(() => {
    const currentValue = value !== undefined ? value : internalValue;
    if (!currentValue) return '';
    if (formatValue) return formatValue(currentValue);
    const selectedItem = data.find((item) => item.value === currentValue);
    if (selectedItem?.label) return selectedItem.label;
    const asyncItem = asyncResults.find((item) => item.value === currentValue);
    if (asyncItem?.label) return asyncItem.label;
    return selectedLabel || '';
  }, [value, internalValue, data, formatValue, asyncResults, selectedLabel]);
  const filteredData = useMemo(() => {
    if (onSearchAsync) {
      return asyncResults;
    }
    if (!searchTerm) return data;
    if (onSearch) {
      return onSearch(searchTerm, data);
    }
    return data.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, data, onSearch, onSearchAsync, asyncResults]);

  React.useEffect(() => {
    let cancelled = false;
    if (onSearchAsync) {
      (async () => {
        const term = searchTerm || '';
        const results = await onSearchAsync(term);
        if (!cancelled) setAsyncResults(results);
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [searchTerm, onSearchAsync]);

  // Resolve initial label when starting with a pre-filled value
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentValue = value !== undefined ? value : internalValue;
      if (!currentValue || !getLabelAsync) return;
      // If we can already resolve label from data/asyncResults/selectedLabel, skip
      const inData = data.find((d) => d.value === currentValue);
      const inAsync = asyncResults.find((d) => d.value === currentValue);
      if (inData?.label || inAsync?.label || selectedLabel) return;
      try {
        const result = await getLabelAsync(currentValue);
        if (cancelled) return;
        if (typeof result === 'string') {
          setSelectedLabel(result);
        } else if (result && (result as any).label) {
          setSelectedLabel((result as any).label);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value, internalValue, getLabelAsync, data, asyncResults, selectedLabel]);

  const renderSearchItem = ({ item }: { item: ComboboxItem<T> }) => {
    const isSelected = item.value === tempValue;
    return (
      <Pressable
        onPress={() => {
          setTempValue(item.value);
          setSearchTerm(item.label);
          searchInputRef.current?.blur();
        }}>
        <Text
          className={cn(
            'p-4',
            filteredData[0] !== item && 'border-t border-t-border',
            isSelected && 'text-tonal'
          )}
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
              ref={searchInputRef}
              autoFocus
              placeholder="Search..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              rightView={
                <Search
                  className="pointer-events-none mr-2 text-text-default opacity-50"
                  size={20}
                />
              }
            />
            <FlatList data={filteredData} renderItem={renderSearchItem} />
          </View>

          <Button onPress={handleSave} className="w-full">
            <Text>Save</Text>
          </Button>
        </View>
      </Sheet>
    </>
  );
}
