import React from 'react';
import { View } from 'react-native';
import { useFieldContext } from './context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Text } from '~/components/ui/text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';
import { InputLabel } from '../ui/label';

export interface SelectFieldProps {
  label: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

export const SelectField = ({ label, placeholder = 'Select...', options }: SelectFieldProps) => {
  const field = useFieldContext<string>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, {
    fieldName: field.name,
  });

  const handleChange = (value: { value: string; label: string } | undefined) => {
    if (value) {
      field.handleChange(value.value);
    }
  };

  const handleBlur = () => {
    field.handleBlur();
    if (validationModeContext) {
      validationModeContext.markFieldBlurred(field.name);
    }
  };

  const currentValue = field.state.value
    ? {
        value: field.state.value,
        label: options.find((o) => o.value === field.state.value)?.label || field.state.value,
      }
    : undefined;

  return (
    <View className="flex-1 gap-4">
      <InputLabel>{label}</InputLabel>
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger
          className="h-12 rounded-[29px] border-border-default bg-surface-high"
          onBlur={handleBlur}>
          <SelectValue className="text-text-default" placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} label={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errorMessage && (
        <Text variant="footnote" className="mt-1 text-destructive">
          {errorMessage}
        </Text>
      )}
    </View>
  );
};
