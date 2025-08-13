import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';

type IOSDatePickerProps = Omit<React.ComponentProps<typeof DateTimePicker>, 'display'> & {
  mode: 'date' | 'time' | 'datetime';
  disabled?: boolean;
};

// Platform-specific native wrapper: iOS uses inline calendar
export function DatePicker(props: IOSDatePickerProps) {
  return (
    <DateTimePicker
      {...(props as any)}
      display="inline"
      // className="scale-120 h-auto w-full"
      style={{ scaleX: 1.2, scaleY: 1.2 }}
    />
  );
}
