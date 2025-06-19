import { useState, useRef, useCallback } from 'react';
import { TextInput } from 'react-native';
import { Country, type CountryCode } from 'react-native-country-picker-modal';
import { getCountryCallingCodeAsync } from 'react-native-country-picker-modal/lib/CountryService';
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
  const [countryCode, setCountryCode] = useState<CountryCode>(defaultValues?.countryCode || 'US');
  const [callingCode, setCallingCode] = useState(defaultValues?.callingCode || '+1');
  const [phoneNumber, setPhoneNumber] = useState(
    value || defaultValues?.phoneNumber || callingCode
  );

  // Get the mask for the current country
  const mask = MASK_PER_COUNTRY[countryCode] || [];

  const handleCountrySelect = useCallback(
    async (country: Country, oldCountryCode?: CountryCode) => {
      const newCallingCode = await getCountryCallingCodeAsync(country.cca2);
      let newPhoneNumber: string;

      // If we have an old country code, replace the old calling code with the new one
      if (oldCountryCode) {
        const oldCallingCode = await getCountryCallingCodeAsync(oldCountryCode);
        newPhoneNumber = phoneNumber.replace(oldCallingCode, newCallingCode);
      } else {
        // Otherwise, update phone number with new calling code
        const currentNumberWithoutCode = phoneNumber.replace(/^\+\d+\s?/, '');
        newPhoneNumber = `${newCallingCode} ${currentNumberWithoutCode}`;
      }

      setCountryCode(country.cca2);
      setCallingCode(newCallingCode);
      setPhoneNumber(newPhoneNumber);

      onChangeCountry?.(country);
      onChangeCountryCode?.(country.cca2);
      onChangeText?.(newPhoneNumber);
    },
    [phoneNumber, onChangeCountry, onChangeCountryCode, onChangeText]
  );

  const handleTextChange = useCallback(
    (text: string) => {
      const { masked, unmasked } = formatWithMask({
        text,
        mask,
      });
      // For our simplified use case, we'll just handle the masked text
      setPhoneNumber(masked);
      onChangeText?.(unmasked);
    },
    [onChangeText, mask]
  );

  return {
    models: {
      countryCode,
      callingCode,
      phoneNumber,
      mask,
      inputRef,
    },
    actions: {
      handleCountrySelect,
      handleChangeText: handleTextChange,
      setPhoneNumber,
    },
  };
};
