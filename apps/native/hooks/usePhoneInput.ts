import { useState, useRef, useCallback } from 'react';
import { TextInput } from 'react-native';
import { type CountryCode } from 'react-native-country-picker-modal';
import { getCountryCallingCodeAsync } from 'react-native-country-picker-modal/lib/CountryService';
import { MASK_PER_COUNTRY } from 'react-native-phone-entry';

interface PhoneInputProps {
  defaultValues?: {
    countryCode?: CountryCode;
    callingCode?: string;
    phoneNumber?: string;
  };
  value?: string;
  onChangeCountry?: (country: any) => void;
  onChangeText?: (text: string) => void;
  isCallingCodeEditable?: boolean;
}

export const usePhoneInput = ({
  defaultValues,
  value,
  onChangeCountry,
  onChangeText,
  isCallingCodeEditable = true,
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
    async (country: any) => {
      const newCallingCode = await getCountryCallingCodeAsync(country.cca2);

      setCountryCode(country.cca2);
      setCallingCode(newCallingCode);

      // Update phone number with new calling code
      const currentNumberWithoutCode = phoneNumber.replace(/^\+\d+\s?/, '');
      const newPhoneNumber = `${newCallingCode} ${currentNumberWithoutCode}`;
      setPhoneNumber(newPhoneNumber);

      onChangeCountry?.(country);
      onChangeText?.(newPhoneNumber);
    },
    [phoneNumber, onChangeCountry, onChangeText]
  );

  const handleTextChange = useCallback(
    (masked: string, unmasked: string, obfuscated: string) => {
      // For our simplified use case, we'll just handle the masked text
      setPhoneNumber(masked);
      onChangeText?.(masked);
    },
    [onChangeText]
  );

  const handleSimpleTextChange = useCallback(
    (text: string) => {
      setPhoneNumber(text);
      onChangeText?.(text);
    },
    [onChangeText]
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
      onSelect: handleCountrySelect,
      handleChangeText: handleTextChange,
      handleSimpleTextChange,
      setPhoneNumber,
    },
    forms: {
      // These would be used for modal management if needed
      modalVisible: false,
      showModal: () => {},
      hideModal: () => {},
    },
  };
};
