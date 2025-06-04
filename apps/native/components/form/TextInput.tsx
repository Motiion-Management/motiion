import { TextField } from '~/components/nativewindui/TextField';
import { useFieldContext } from './context';

interface TextInputProps {
  label: string;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
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