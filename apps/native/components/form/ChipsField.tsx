import React, { useMemo, useState, useCallback } from 'react';
import { View } from 'react-native';
import { useFieldContext } from './context';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';
import { Chips } from '~/components/ui/chips';
import { HelperText } from '../ui/helper-text';

export interface ChipsFieldProps {
  label: string;
  placeholder?: string;
  helpText?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const ChipsField = ({
  label,
  placeholder,
  helpText,
  autoCapitalize = 'words',
}: ChipsFieldProps) => {
  const field = useFieldContext<string[]>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, { fieldName: field.name });

  const chips: string[] = useMemo(
    () => (Array.isArray(field.state.value) ? field.state.value : []),
    [field.state.value]
  );
  const [buffer, setBuffer] = useState('');

  const commitBuffer = useCallback(() => {
    const value = buffer.trim();
    if (!value) return;
    const next = Array.from(new Set([...(chips || []), value]));
    field.handleChange(next);
    setBuffer('');
    if (validationModeContext) validationModeContext.markFieldBlurred(field.name);
  }, [buffer, chips, field, validationModeContext]);

  const removeChip = useCallback(
    (chip: string) => {
      const next = (chips || []).filter((c) => c !== chip);
      field.handleChange(next);
      if (validationModeContext) validationModeContext.markFieldBlurred(field.name);
    },
    [chips, field, validationModeContext]
  );

  const handleKeyPress = useCallback(
    (e: any) => {
      if (e?.nativeEvent?.key === 'Enter') {
        e.preventDefault?.();
        commitBuffer();
      }
      // If buffer empty and backspace pressed, remove last chip
      if (e?.nativeEvent?.key === 'Backspace' && buffer.length === 0 && chips.length > 0) {
        removeChip(chips[chips.length - 1]);
      }
    },
    [commitBuffer, buffer, chips, removeChip]
  );

  const handleBlur = () => {
    // Commit any pending text on blur
    commitBuffer();
    field.handleBlur();
    if (validationModeContext) {
      validationModeContext.markFieldBlurred(field.name);
    }
  };

  return (
    <View className="gap-2">
      <Input
        label={label}
        placeholder={placeholder}
        value={buffer}
        onChangeText={setBuffer}
        onSubmitEditing={commitBuffer}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        errorMessage={errorMessage}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        clearButtonMode="while-editing"
        onClear={() => setBuffer('')}
        returnKeyType="done"
      />
      {helpText && <HelperText message={helpText} />}
      <Chips items={chips} onRemove={removeChip} variant="combo" />
    </View>
  );
};
