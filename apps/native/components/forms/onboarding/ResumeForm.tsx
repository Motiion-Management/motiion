import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import type { FormHandle, FormProps } from './contracts';

interface ResumeFormValues {
  // Resume upload is optional, no data needed
  resume?: any;
}

export const ResumeForm = forwardRef<FormHandle, FormProps<ResumeFormValues>>(
  ({ onSubmit, onValidChange }, ref) => {
    // Resume step is always valid (optional)
    React.useEffect(() => {
      onValidChange?.(true);
    }, [onValidChange]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        // Resume is optional, just continue
        await onSubmit({});
      },
      isDirty: () => false, // Resume is optional
      isValid: () => true, // Resume is optional
    }));

    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-text-secondary text-center">
          Resume import functionality coming soon.
        </Text>
        <Text className="text-text-secondary mt-2 text-center">
          You can skip this step for now.
        </Text>
      </View>
    );
  }
);

ResumeForm.displayName = 'ResumeForm';
