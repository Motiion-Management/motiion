import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import * as React from 'react'
import { Pressable, View } from 'react-native'

import { Input } from '~/components/ui/input'
import { cn } from '~/lib/cn'
import Calendar from '~/lib/icons/Calendar'

type AndroidDatePickerProps = React.ComponentProps<typeof DateTimePicker> & {
  mode: 'date' | 'time' | 'datetime'
  // Optional custom display formatters
  formatDate?: (date: Date) => string
  formatTime?: (date: Date) => string
  // Deprecated material label props kept for backward compatibility (no-op now)
  materialDateClassName?: string
  materialDateLabel?: string
  materialDateLabelClassName?: string
  materialTimeClassName?: string
  materialTimeLabel?: string
  materialTimeLabelClassName?: string
}

export function DatePicker(props: AndroidDatePickerProps) {
  const show = (currentMode: 'time' | 'date') => () => {
    DateTimePickerAndroid.open({
      value: props.value,
      onChange: props.onChange,
      mode: currentMode,
      minimumDate: props.minimumDate,
      maximumDate: props.maximumDate,
    })
  }

  const formatDate = React.useCallback(
    (d: Date) =>
      props.formatDate?.(d) ??
      new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
      }).format(d),
    [props.formatDate]
  )

  const formatTime = React.useCallback(
    (d: Date) =>
      props.formatTime?.(d) ??
      new Intl.DateTimeFormat('en-US', {
        timeStyle: 'short',
      }).format(d),
    [props.formatTime]
  )

  return (
    <View className="flex-row gap-2.5">
      {props.mode.includes('date') && (
        <View className={cn('flex-1', props.materialDateClassName)}>
          <Pressable onPress={show('date')}>
            <Input
              value={formatDate(props.value as Date)}
              readOnly
              rightView={<Calendar className="text-text-default opacity-50" size={20} />}
            />
          </Pressable>
        </View>
      )}
      {props.mode.includes('time') && (
        <View className={cn('flex-1', props.materialTimeClassName)}>
          <Pressable onPress={show('time')}>
            <Input
              value={formatTime(props.value as Date)}
              readOnly
              rightView={<Calendar className="text-text-default opacity-50" size={20} />}
            />
          </Pressable>
        </View>
      )}
    </View>
  )
}
