import { api } from '@packages/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import React, { useCallback, useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';

import { Button } from '~/components/ui/button';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { WheelPicker, WheelPickerData } from '~/components/ui/wheel-picker';
import X from '~/lib/icons/X';
import { SizingMetricConfig } from '~/types/sizing';

interface SizingPickerSheetProps {
  metric: SizingMetricConfig;
  initialValue?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const SizingPickerSheet: React.FC<SizingPickerSheetProps> = ({
  metric,
  initialValue,
  isOpen,
  onOpenChange,
}) => {
  const updateSizingField = useMutation(api.users.updateMySizingField);
  // Initialize with initialValue or first available value
  const defaultValue = initialValue || metric.values[0];
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [originalValue] = useState(defaultValue);
  const [isSaving, setIsSaving] = useState(false);

  // Reset to initial value when initialValue changes
  useEffect(() => {
    const value = initialValue || metric.values[0];
    setSelectedValue(value);
  }, [initialValue, metric.values]);

  const hasValueChanged = selectedValue !== originalValue;

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Use the dedicated sizing field mutation
      await updateSizingField({
        section: metric.section,
        field: metric.field,
        value: selectedValue,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating sizing:', error);
      // Could add error handling/toast here
    } finally {
      setIsSaving(false);
    }
  }, [selectedValue, updateSizingField, metric.section, metric.field, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleValueChange = useCallback((value: string) => {
    setSelectedValue(value);
  }, []);

  const pickerData: WheelPickerData[] = metric.values.map((value) => ({
    value,
    label: value,
  }));

  return (
    <Sheet isOpened={isOpen} onIsOpenedChange={onOpenChange}>
      <View className="z-10">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text variant="header4" className="text-text-default">
            {`<${metric.label}>`}
          </Text>
          <Pressable onPress={handleClose} className="p-2">
            <X className="h-6 w-6 color-icon-default" />
          </Pressable>
        </View>

        {/* Picker */}
        <View className="items-center justify-center py-4">
          <View className="h-[178px] w-full overflow-hidden rounded-lg">
            <View className="relative h-full">
              {/* Highlight region */}
              <View className="absolute left-0 right-0 top-1/2 h-14 -translate-y-1/2 border-b border-t border-border-accent bg-surface-high" />

              {/* Picker */}
              <View className="h-full items-center justify-center">
                <WheelPicker
                  width={402}
                  data={pickerData}
                  value={selectedValue}
                  onValueChange={handleValueChange}
                  label={metric.unit}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-4 pb-8 pt-4">
          <Button onPress={handleSave} disabled={!hasValueChanged || isSaving} className="w-full">
            <Text>{isSaving ? 'Saving...' : 'Save'}</Text>
          </Button>
        </View>
      </View>
    </Sheet>
  );
};

SizingPickerSheet.displayName = 'SizingPickerSheet';
