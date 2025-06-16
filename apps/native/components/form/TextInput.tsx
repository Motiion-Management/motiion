import { Input as TextField } from '~/components/ui/input';
import { useFieldContext } from './context';

interface TextInputProps {
  label: string;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'name' | 'email' | 'off' | 'username' | 'password' | 'url' | 'tel' | 'sms-otp' | 'current-password' | 'new-password' | 'given-name' | 'family-name';
  autoFocus?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

export const TextInput = ({ label, placeholder, ...props }: TextInputProps) => {
  const field = useFieldContext<string>();
  
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={field.state.value}
      onChangeText={field.handleChange}
      onBlur={field.handleBlur}
      errorMessage={field.state.meta.errors?.[0]}
      {...props}
    />
  );
};