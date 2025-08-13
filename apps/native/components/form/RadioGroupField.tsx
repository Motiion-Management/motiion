import { forwardRef } from 'react';
import { View } from 'react-native';

import { useFieldContext } from './context';

import { RadioGroup, RadioGroupItemCard } from '~/components/ui/radio-group';
import { Text } from '~/components/ui/text';
import { ErrorText } from '~/components/ui/error-text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';

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
    const validationModeContext = useValidationModeContextSafe();
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
            <RadioGroupItemCard
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
              current={field.state.value}
            />
          ))}
        </RadioGroup>

        <ErrorText>{errorMessage}</ErrorText>
      </View>
    );
  }
);

RadioGroupField.displayName = 'RadioGroupField';
