import React from 'react';
import { View } from 'react-native';
import { useFieldContext } from './context';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';

export interface ChipsFieldProps {
  label: string;
  placeholder?: string;
  helpText?: string;
}

export const ChipsField = ({ label, placeholder, helpText }: ChipsFieldProps) => {
  const field = useFieldContext<string[]>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, {
    fieldName: field.name,
  });

  const handleChange = (text: string) => {
    const items = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    field.handleChange(items);
  };

  const handleBlur = () => {
    field.handleBlur();
    if (validationModeContext) {
      validationModeContext.markFieldBlurred(field.name);
    }
  };

  const currentValue = Array.isArray(field.state.value) ? field.state.value.join(', ') : '';

  return (
    <View>
      <Input
        label={label}
        placeholder={placeholder}
        value={currentValue}
        onChangeText={handleChange}
        onBlur={handleBlur}
        errorMessage={errorMessage}
      />
      {helpText && (
        <Text variant="footnote" className="mt-1 text-text-low">
          {helpText}
        </Text>
      )}
    </View>
  );
};
