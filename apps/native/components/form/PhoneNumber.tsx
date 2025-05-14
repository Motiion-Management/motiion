import { useFieldContext } from './context';
import { TextField } from '../nativewindui/TextField';

/**
 * Cleans a phone number string by removing all non-digit characters
 * @param {string} phoneNumber - The phone number to clean
 * @returns {string} - The cleaned phone number containing only digits
 */
const cleanPhoneNumber = (phoneNumber: string) => {
  // Remove all non-digit characters
  return phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
};

/**
 * Formats a phone number string into (XXX) XXX-XXXX format
 * @param {string} phoneNumber - The phone number to format (can be raw or already cleaned)
 * @returns {string} - The formatted phone number
 */
const formatPhoneNumber = (phoneNumber: string) => {
  // First clean the phone number to ensure we're working with digits only
  const cleaned = cleanPhoneNumber(phoneNumber);

  // Check if the input is blank or too short
  if (cleaned.length === 0) {
    return undefined;
  } else if (cleaned.length < 4) {
    // Just show the area code being built: (X, (XX, (XXX
    return `(${cleaned}`;
  } else if (cleaned.length < 7) {
    // Show area code and beginning of prefix: (XXX) X, (XXX) XX, (XXX) XXX
    const areaCode = cleaned.substring(0, 3);
    const prefix = cleaned.substring(3, 6);
    return `(${areaCode}) ${prefix}`;
  } else {
    // Complete number with area code, prefix, and line number
    const areaCode = cleaned.substring(0, 3);
    const prefix = cleaned.substring(3, 6);
    const lineNumber = cleaned.substring(6, 10);
    return `(${areaCode}) ${prefix}-${lineNumber}`;
  }
};

export const PhoneNumber = () => {
  const field = useFieldContext<string>();
  return (
    <TextField
      containerClassName="flex-1"
      placeholder="XXX XXX XXXX"
      label="Phone Number"
      value={formatPhoneNumber(field.state.value)}
      onChangeText={(text) => field.handleChange(cleanPhoneNumber(text))}
      submitBehavior="blurAndSubmit"
      errorMessage={field.state.meta.errors[0]}
      autoFocus
      textContentType="telephoneNumber"
      autoComplete="tel"
      keyboardType="number-pad"
      returnKeyType="done"
    />
  );
};
