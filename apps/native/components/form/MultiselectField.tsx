import { forwardRef } from 'react';
import { View } from 'react-native';

import { useFieldContext } from './context';

import { Multiselect, MultiselectItem } from '~/components/ui/multiselect';
import { Text } from '~/components/ui/text';
import { ErrorText } from '~/components/ui/error-text';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';

export interface MultiselectFieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface MultiselectFieldProps {
  options: MultiselectFieldOption[];
  label?: string;
  className?: string;
}

export const MultiselectField = forwardRef<View, MultiselectFieldProps>(
  ({ options, label, className, ...props }, ref) => {
    const field = useFieldContext<string[]>();
    const validationModeContext = useValidationModeContextSafe();
    const { errorMessage } = useFieldError(field, { fieldName: field.name });

    const handleValueChange = (values: string[]) => {
      field.handleChange(values);

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

        <Multiselect
          values={field.state.value || []}
          onValueChange={handleValueChange}
          className="space-y-3">
          {options.map((option) => (
            <MultiselectItem
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
            />
          ))}
        </Multiselect>

        <ErrorText>{errorMessage}</ErrorText>
      </View>
    );
  }
);

MultiselectField.displayName = 'MultiselectField';
