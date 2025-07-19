import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useRef, useEffect } from 'react';
import { View, Pressable } from 'react-native';

import { Button } from '~/components/ui/button';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { WheelPicker, WheelPickerData } from '~/components/ui/wheel-picker';
import X from '~/lib/icons/X';
import { SizingMetricConfig } from '~/types/sizing';

interface SizingPickerSheetProps {
  isOpen: boolean;
  config: SizingMetricConfig | null;
  selectedValue: string;
  hasValueChanged: boolean;
  onClose: () => void;
  onValueChange: (value: string) => void;
  onSave: (value: string) => void;
}

export function SizingPickerSheet({
  isOpen,
  config,
  selectedValue,
  hasValueChanged,
  onClose,
  onValueChange,
  onSave,
}: SizingPickerSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const handleSave = useCallback(() => {
    if (config) {
      onSave(selectedValue);
      onClose();
    }
  }, [config, selectedValue, onSave, onClose]);

  if (!config) return null;

  const pickerData: WheelPickerData[] = config.values.map((value) => ({
    value,
    label: value,
  }));

  return (
    <Sheet ref={sheetRef} snapPoints={['50%']} onDismiss={onClose}>
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <Text variant="header2" className="text-text-default">
            {`<${config.label}>`}
          </Text>
          <Pressable onPress={onClose} className="p-2">
            <X className="text-text-tertiary h-6 w-6" />
          </Pressable>
        </View>

        {/* Picker */}
        <View className="flex-1 items-center justify-center">
          <View className="h-[178px] w-full overflow-hidden rounded-lg border border-border-low">
            <View className="relative h-full">
              {/* Highlight region */}
              <View className="absolute left-0 right-0 top-1/2 h-14 -translate-y-1/2 border-b border-t border-border-accent bg-surface-high" />

              {/* Picker */}
              <View className="h-full items-center justify-center">
                <WheelPicker
                  width={200}
                  data={pickerData}
                  value={selectedValue}
                  onValueChange={onValueChange}
                  label={config.unit}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="pb-8 pt-4">
          <Button onPress={handleSave} disabled={!hasValueChanged} className="w-full">
            <Text>Save</Text>
          </Button>
        </View>
      </View>
    </Sheet>
  );
}
