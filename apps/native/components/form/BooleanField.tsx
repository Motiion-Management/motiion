import React from 'react';
import { View } from 'react-native';
import { useFieldContext } from './context';
import { Text } from '~/components/ui/text';
import { ErrorText } from '~/components/ui/error-text';
import { Checkbox } from '~/components/ui/checkbox';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';
import { useFieldError } from '~/hooks/useFieldError';

export interface BooleanFieldProps {
  label: string;
  helpText?: string;
}

export const BooleanField = ({ label, helpText }: BooleanFieldProps) => {
  const field = useFieldContext<boolean>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, { fieldName: field.name });

  const handleToggle = (checked: boolean) => {
    field.handleChange(!!checked);
    if (validationModeContext) {
      validationModeContext.markFieldBlurred(field.name);
    }
  };

  const checked = !!field.state.value;

  return (
    <View className="flex-row items-center gap-3">
      <Checkbox checked={checked} onCheckedChange={handleToggle} />
      <View className="flex-1">
        <Text>{label}</Text>
        {helpText && (
          <Text variant="footnote" className="text-text-secondary">
            {helpText}
          </Text>
        )}
        <ErrorText>{errorMessage}</ErrorText>
      </View>
    </View>
  );
};
