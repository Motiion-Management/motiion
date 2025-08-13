import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';

type AndroidDatePickerProps = Omit<React.ComponentProps<typeof DateTimePicker>, 'display'> & {
  mode: 'date' | 'time' | 'datetime';
  disabled?: boolean;
};

// Platform-specific native wrapper: Android uses spinner by default
export function DatePicker(props: AndroidDatePickerProps) {
  return <DateTimePicker {...(props as any)} display="spinner" />;
}
