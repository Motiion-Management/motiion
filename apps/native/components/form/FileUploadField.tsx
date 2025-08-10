import React, { useCallback } from 'react';
import { View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '~/components/ui/button/button';
import { Text } from '~/components/ui/text';
import { ErrorText } from '~/components/ui/error-text';
import { useFieldContext } from './context';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';

export interface FileUploadFieldProps {
  label: string;
  helpText?: string;
}

// MVP: lets user pick an image/file and stores its local URI in the form value.
// TODO: integrate upload and persist returned _storage id.
export const FileUploadField = ({ label, helpText }: FileUploadFieldProps) => {
  const field = useFieldContext<string | undefined>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, { fieldName: field.name });

  const pickFile = useCallback(async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        field.handleChange(uri);
        field.handleBlur();
        if (validationModeContext) validationModeContext.markFieldBlurred(field.name);
      }
    } catch (e) {
      console.warn('File picker error', e);
    }
  }, [field]);

  return (
    <View className="gap-2">
      <Text variant="label" className="text-text-secondary">{label}</Text>
      <Button onPress={pickFile}>
        <Text>Pick File</Text>
      </Button>
      {field.state.value && (
        <Text variant="footnote" className="text-text-secondary">Selected: {field.state.value}</Text>
      )}
      <ErrorText>{errorMessage}</ErrorText>
      {helpText && (
        <Text variant="footnote" className="text-text-secondary">{helpText}</Text>
      )}
    </View>
  );
};
