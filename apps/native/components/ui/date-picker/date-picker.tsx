import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';

export function DatePicker({
  materialDateClassName,
  materialDateLabel,
  materialDateLabelClassName,
  materialTimeClassName,
  materialTimeLabel,
  materialTimeLabelClassName,
  ...props
}: React.ComponentProps<typeof DateTimePicker> & {
  mode: 'date' | 'time' | 'datetime';
} & {
  materialDateClassName?: string;
  materialDateLabel?: string;
  materialDateLabelClassName?: string;
  materialTimeClassName?: string;
  materialTimeLabel?: string;
  materialTimeLabelClassName?: string;
}) {
  return <DateTimePicker {...props} />;
}
