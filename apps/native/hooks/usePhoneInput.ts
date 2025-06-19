import { useState, useRef, useCallback, useEffect } from 'react';
import { TextInput } from 'react-native';
import { Country, type CountryCode } from 'react-native-country-picker-modal';
import { formatWithMask } from 'react-native-mask-input';
import { MASK_PER_COUNTRY } from 'react-native-phone-entry';

interface PhoneInputProps {
  defaultValues?: {
    countryCode?: CountryCode;
    callingCode?: string;
    phoneNumber?: string;
  };
  value?: string;
  onChangeCountryCode?: (newCountryCode: CountryCode) => void;
  onChangeCountry?: (newCountry: Country) => void;
  onChangeText?: (text: string) => void;
}

export const usePhoneInput = ({
  defaultValues,
  value,
  onChangeCountryCode,
  onChangeCountry,
  onChangeText,
}: PhoneInputProps) => {
  const inputRef = useRef<TextInput | null>(null);

  // Store full country object as single source of truth
  const [country, setCountry] = useState<Country>({
    cca2: (defaultValues?.countryCode || 'US') as CountryCode,
    name: { common: 'United States' },
    callingCode: ['1'], // Default for US
  } as Country);

  // Derive values from country object
  const countryCode = country.cca2;
  const callingCode = `+${country.callingCode?.[0] || '1'}`;

  // Extract national number from the full phone number (removing calling code)
  const extractNationalNumber = (fullNumber: string, currentCallingCode?: string) => {
    if (!fullNumber) return '';
    if (currentCallingCode && fullNumber.startsWith(currentCallingCode)) {
      return fullNumber.slice(currentCallingCode.length);
    }
    // Fallback: remove any leading calling code pattern
    return fullNumber.replace(/^\+\d+/, '');
  };

  // For display, we only show the national number part
  const [nationalNumber, setNationalNumber] = useState(
    extractNationalNumber(value || defaultValues?.phoneNumber || '', callingCode)
  );

  // Derive mask from current country
  const mask = MASK_PER_COUNTRY[countryCode] || [];

  // Sync national number when value changes externally
  useEffect(() => {
    if (value) {
      const extractedNumber = extractNationalNumber(value, callingCode);
      if (extractedNumber) {
        const { masked } = formatWithMask({
          text: extractedNumber,
          mask,
        });
        setNationalNumber(masked);
      }
    }
  }, [value, mask, callingCode]);

  const handleCountrySelect = useCallback(
    (newCountry: Country) => {
      const newCallingCode = `+${newCountry.callingCode?.[0] || '1'}`;
      const newMask = MASK_PER_COUNTRY[newCountry.cca2] || [];

      // Extract the national number from the current E.164 value using current country
      let nationalDigits = '';
      if (value) {
        const currentCallingCode = `+${country.callingCode?.[0] || '1'}`;
        // Safely remove the current calling code from the beginning only
        nationalDigits = value.startsWith(currentCallingCode)
          ? value.slice(currentCallingCode.length)
          : value.replace(/^\+\d+/, '');
      }

      // Update state - single source of truth
      setCountry(newCountry);

      // Update display with new formatting
      if (nationalDigits) {
        const { masked } = formatWithMask({
          text: nationalDigits,
          mask: newMask,
        });
        setNationalNumber(masked);
      }

      // Combine new calling code with existing national digits
      const fullE164Number = nationalDigits ? `${newCallingCode}${nationalDigits}` : newCallingCode;

      onChangeCountry?.(newCountry);
      onChangeCountryCode?.(newCountry.cca2);
      onChangeText?.(fullE164Number);
    },
    [value, country.callingCode, onChangeCountry, onChangeCountryCode, onChangeText]
  );

  const handleTextChange = useCallback(
    (text: string) => {
      const { masked, unmasked } = formatWithMask({
        text,
        mask,
      });

      // Update the national number display
      setNationalNumber(masked);

      // Create full E.164 format by combining calling code with unmasked number
      const fullE164Number = `${callingCode}${unmasked}`;
      onChangeText?.(fullE164Number);
    },
    [onChangeText, mask, callingCode]
  );

  return {
    models: {
      countryCode,
      callingCode,
      phoneNumber: nationalNumber,
      mask,
      inputRef,
    },
    actions: {
      handleCountrySelect,
      handleChangeText: handleTextChange,
      setPhoneNumber: setNationalNumber,
    },
  };
};
