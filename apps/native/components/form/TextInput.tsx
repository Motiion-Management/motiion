import { useFieldContext } from './context';

import { Input as TextField } from '~/components/ui/input';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContext } from '~/hooks/useValidationMode';

interface TextInputProps {
  label: string;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?:
    | 'name'
    | 'email'
    | 'off'
    | 'username'
    | 'password'
    | 'url'
    | 'tel'
    | 'sms-otp'
    | 'current-password'
    | 'new-password'
    | 'given-name'
    | 'family-name';
  autoFocus?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

export const TextInput = ({ label, placeholder, ...props }: TextInputProps) => {
  const field = useFieldContext<string>();
  
  // Try to use validation mode context if available
  let validationModeContext: ReturnType<typeof useValidationModeContext> | undefined;
  try {
    validationModeContext = useValidationModeContext();
  } catch {
    // Not in ValidationModeProvider, use default behavior
  }
  
  const { errorMessage } = useFieldError(field, { 
    fieldName: field.name
  });

  const handleBlur = () => {
    field.handleBlur();
    // Mark field as blurred in validation mode
    if (validationModeContext) {
      validationModeContext.markFieldBlurred(field.name);
    }
  };

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={field.state.value}
      onChangeText={field.handleChange}
      onBlur={handleBlur}
      errorMessage={errorMessage}
      {...props}
    />
  );
};
