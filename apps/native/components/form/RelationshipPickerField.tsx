import React from 'react';
import { View } from 'react-native';
import { useFieldContext } from './context';
import { Text } from '~/components/ui/text';
import { ErrorText } from '~/components/ui/error-text';
import { Input } from '~/components/ui/input';
import { BottomSheetComboboxField } from './BottomSheetComboboxField';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';

export interface RelationshipPickerFieldProps {
  label: string;
  relatedTable?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>; // optional static options
  helpText?: string;
}

export const RelationshipPickerField = ({
  label,
  relatedTable,
  placeholder,
  options,
  helpText,
}: RelationshipPickerFieldProps) => {
  const field = useFieldContext<string | undefined>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, { fieldName: field.name });

  const handleBlur = () => {
    field.handleBlur();
    if (validationModeContext) validationModeContext.markFieldBlurred(field.name);
  };

  // If we have options, use combobox; otherwise fallback to raw Id input (MVP)
  if (options && options.length > 0) {
    return (
      <BottomSheetComboboxField
        label={label}
        placeholder={placeholder || `Select ${relatedTable || 'record'}`}
        data={options}
      />
    );
  }

  return (
    <View>
      <Input
        label={label}
        placeholder={placeholder || `Enter ${relatedTable || 'record'} id`}
        value={field.state.value || ''}
        onChangeText={field.handleChange}
        onBlur={handleBlur}
        errorMessage={errorMessage}
      />
      <Text variant="footnote" className="mt-1 text-text-disabled">
        Relationship to {relatedTable || 'table'} — enter or paste the id
      </Text>
      {helpText && (
        <Text variant="footnote" className="text-text-secondary">
          {helpText}
        </Text>
      )}
    </View>
  );
};
