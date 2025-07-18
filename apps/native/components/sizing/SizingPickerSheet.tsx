import { BottomSheetModal } from '@gorhom/bottom-sheet'
import React, { forwardRef, useCallback, useState, useImperativeHandle } from 'react'
import { View, Pressable } from 'react-native'

import { Sheet } from '~/components/ui/sheet'
import { Text } from '~/components/ui/text'
import { WheelPicker, WheelPickerData } from '~/components/ui/wheel-picker'
import { Button } from '~/components/ui/button'
import X from '~/lib/icons/X'
import { SizingMetricConfig } from '~/types/sizing'

interface SizingPickerSheetProps {
  config?: SizingMetricConfig
  currentValue?: string
  onSave: (value: string) => void
}

export interface SizingPickerSheetRef {
  present: (config: SizingMetricConfig, currentValue?: string) => void
  dismiss: () => void
}

export const SizingPickerSheet = forwardRef<SizingPickerSheetRef, SizingPickerSheetProps>(
  ({ onSave }, ref) => {
    const sheetRef = React.useRef<BottomSheetModal>(null)
    const [config, setConfig] = useState<SizingMetricConfig | null>(null)
    const [selectedValue, setSelectedValue] = useState<string>('')
    const [initialValue, setInitialValue] = useState<string>('')

    const present = useCallback((newConfig: SizingMetricConfig, currentValue?: string) => {
      setConfig(newConfig)
      const value = currentValue || newConfig.values[0]
      setSelectedValue(value)
      setInitialValue(value)
      sheetRef.current?.present()
    }, [])

    const dismiss = useCallback(() => {
      sheetRef.current?.dismiss()
    }, [])

    useImperativeHandle(ref, () => ({
      present,
      dismiss,
    }), [present, dismiss])

    const handleSave = useCallback(() => {
      if (config) {
        onSave(selectedValue)
        dismiss()
      }
    }, [config, selectedValue, onSave, dismiss])

    const handleClose = useCallback(() => {
      dismiss()
    }, [dismiss])

    if (!config) return null

    const pickerData: WheelPickerData[] = config.values.map((value) => ({
      value,
      label: value,
    }))

    const hasValueChanged = selectedValue !== initialValue

    return (
      <Sheet ref={sheetRef} snapPoints={['50%']}>
        <View className="flex-1 px-4">
          {/* Header */}
          <View className="flex-row items-center justify-between py-4">
            <Text variant="header2" className="text-text-default">
              {`<${config.label}>`}
            </Text>
            <Pressable onPress={handleClose} className="p-2">
              <X className="h-6 w-6 text-text-tertiary" />
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
                    onValueChange={setSelectedValue}
                    label={config.unit}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View className="pb-8 pt-4">
            <Button
              onPress={handleSave}
              disabled={!hasValueChanged}
              className="w-full"
            >
              <Text>Save</Text>
            </Button>
          </View>
        </View>
      </Sheet>
    )
  }
)

SizingPickerSheet.displayName = 'SizingPickerSheet'