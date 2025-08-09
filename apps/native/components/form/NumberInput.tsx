import { useFieldContext } from './context';
import { Input as TextField } from '~/components/ui/input';
import { useFieldError } from '~/hooks/useFieldError';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';

export interface NumberInputProps {
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = ({ label, placeholder }: NumberInputProps) => {
  const field = useFieldContext<number | null | undefined>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, {
    fieldName: field.name,
  });

  const handleChange = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') {
      field.handleChange(undefined as unknown as number);
      return;
    }
    const parsed = Number(trimmed.replace(/[^0-9.-]/g, ''));
    if (!Number.isNaN(parsed)) {
      field.handleChange(parsed as unknown as number);
    }
  };

  const handleBlur = () => {
    field.handleBlur();
    if (validationModeContext) {
      validationModeContext.markFieldBlurred(field.name);
    }
  };

  const current = field.state.value;
  const value = current === null || current === undefined ? '' : String(current);

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={value}
      keyboardType="numeric"
      onChangeText={handleChange}
      onBlur={handleBlur}
      errorMessage={errorMessage}
    />
  );
};

