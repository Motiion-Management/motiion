import { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import CountryPicker, {
  Flag,
  DARK_THEME,
  CountryCode,
  type Country,
} from 'react-native-country-picker-modal';
import { getCountryCallingCodeAsync } from 'react-native-country-picker-modal/lib/CountryService';

import { useFieldContext } from './context';

import { HelpText } from '~/components/ui/help-text';
import { Input } from '~/components/ui/input';
import { InputLabel } from '~/components/ui/label';
import { Text } from '~/components/ui/text';
import { usePhoneInput } from '~/hooks/usePhoneInput';
import ChevronDown from '~/lib/icons/ChevronDown';

interface PhoneNumberProps {
  autoFocus?: boolean;
  helpText?: string;
}

export const PhoneNumber = ({ autoFocus = false, helpText }: PhoneNumberProps) => {
  const field = useFieldContext<{ fullNumber: string; countryCode: CountryCode }>();
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [defaultCallingCode, setDefaultCallingCode] = useState('+1');

  const defaultCountryCode = field.state.value.countryCode || 'US';

  useEffect(() => {
    getCountryCallingCodeAsync(defaultCountryCode).then(setDefaultCallingCode);
  }, [defaultCountryCode]);

  const { models, actions } = usePhoneInput({
    defaultValues: {
      countryCode: defaultCountryCode,
      callingCode: defaultCallingCode,
      phoneNumber: field.state.value.fullNumber || '',
    },
    value: field.state.value.fullNumber,
    onChangeText: (text) => {
      field.handleChange({ ...field.state.value, fullNumber: text });
    },
    onChangeCountryCode: (newCountryCode: CountryCode) => {
      field.handleChange({
        ...field.state.value,
        countryCode: newCountryCode,
      });
    },
  });

  const isError = field.state.meta.isDirty && !field.state.meta.isValid;

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row gap-4">
        <InputLabel>Area Code</InputLabel>
        <InputLabel error={isError}>Phone Number</InputLabel>
      </View>

      <View>
        <Input
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          ref={models.inputRef}
          value={models.phoneNumber}
          onChangeText={actions.handleChangeText}
          placeholder={`${models.callingCode} (123) 456-7890`}
          autoFocus={autoFocus}
          invalid={isError}
          leftView={
            <CountryPicker
              withFlag
              withCallingCode
              withEmoji
              withFilter
              visible={countryPickerVisible}
              theme={DARK_THEME}
              countryCode={models.countryCode}
              onSelect={(country: Country) => {
                actions.handleCountrySelect(country, field.state.value.countryCode);
                setCountryPickerVisible(false);
              }}
              onClose={() => setCountryPickerVisible(false)}
              renderFlagButton={() => (
                <Pressable
                  onPress={() => setCountryPickerVisible(true)}
                  className="mr-1 h-full flex-row items-center border-r border-border-default pr-4">
                  <Flag withFlagButton withEmoji countryCode={models.countryCode} flagSize={20} />
                  <Text variant="bodySm" className=" mr-1 text-text-default">
                    {models.countryCode}
                  </Text>
                  <ChevronDown className="color-icon-default" size={14} />
                </Pressable>
              )}
            />
          }
          errorMessage={
            isError
              ? field.state.meta.errors?.[0]?.message || 'Please enter a valid phone number.'
              : undefined
          }
        />
      </View>

      <HelpText
        message={
          helpText ||
          `We will send you a text with a verification code.\nMessage and data rates may apply.`
        }
      />
    </View>
  );
};
