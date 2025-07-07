import { forwardRef } from 'react';
import { View } from 'react-native';

import { useFieldContext } from './context';

import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Text } from '~/components/ui/text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContext } from '~/hooks/useValidationMode';

export interface RadioGroupFieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupFieldProps {
  options: RadioGroupFieldOption[];
  label?: string;
  className?: string;
}

export const RadioGroupField = forwardRef<View, RadioGroupFieldProps>(
  ({ options, label, className, ...props }, ref) => {
    const field = useFieldContext<string>();
    
    // Try to use validation mode context if available
    let validationModeContext: ReturnType<typeof useValidationModeContext> | undefined;
    try {
      validationModeContext = useValidationModeContext();
    } catch {
      // Not in ValidationModeProvider, use default behavior
    }
    
    const { errorMessage } = useFieldError(field, { fieldName: field.name });

    const handleValueChange = (value: string) => {
      field.handleChange(value);
      if (validationModeContext) {
        validationModeContext.markFieldBlurred(field.name);
      }
    };

    return (
      <View ref={ref} className={className}>
        {label && (
          <Text variant="bodyLg" className="mb-4 font-medium">
            {label}
          </Text>
        )}

        <RadioGroup
          value={field.state.value || ''}
          onValueChange={handleValueChange}
          className="space-y-3">
          {options.map((option) => (
            <View
              key={option.value}
              className="flex-row items-center space-x-3 rounded-2xl border border-border bg-card p-4">
              <RadioGroupItem value={option.value} />
              <View className="flex-1">
                <Text variant="body" className="font-medium">
                  {option.label}
                </Text>
                {option.description && (
                  <Text variant="bodySm" className="text-text-secondary mt-1">
                    {option.description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </RadioGroup>

        {errorMessage && (
          <Text variant="bodySm" className="mt-2 text-text-error">
            {errorMessage}
          </Text>
        )}
      </View>
    );
  }
);

RadioGroupField.displayName = 'RadioGroupField';
