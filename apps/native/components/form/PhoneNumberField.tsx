import { useState } from 'react';
import { View, Pressable } from 'react-native';
import CountryPicker, {
  Flag,
  DARK_THEME,
  CountryCode,
  type Country,
} from 'react-native-country-picker-modal';

import { useFieldContext } from './context';

import { Input } from '~/components/ui/input';
import { InputLabel } from '~/components/ui/label';
import { Text } from '~/components/ui/text';
import { useFieldError } from '~/hooks/useFieldError';
import { usePhoneInput } from '~/hooks/usePhoneInput';
import { useValidationModeContextSafe } from '~/hooks/useValidationMode';
import ChevronDown from '~/lib/icons/ChevronDown';

export interface PhoneNumberFieldProps {
  autoFocus?: boolean;
  helpText?: string;
}

export const PhoneNumberField = ({ autoFocus = false, helpText }: PhoneNumberFieldProps) => {
  const field = useFieldContext<{ fullNumber: string; countryCode: CountryCode }>();
  const validationModeContext = useValidationModeContextSafe();
  const { errorMessage } = useFieldError(field, {
    fallbackMessage: 'Please enter a valid phone number.',
    fieldName: field.name,
  });
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  const defaultCountryCode = field.state.value.countryCode || 'US';

  const { models, actions } = usePhoneInput({
    defaultValues: {
      countryCode: defaultCountryCode,
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

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row gap-7">
        <InputLabel>Area Code</InputLabel>
        <InputLabel error={!!errorMessage}>Phone Number</InputLabel>
      </View>

      <View>
        <Input
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          ref={models.inputRef}
          value={models.phoneNumber}
          onChangeText={actions.handleChangeText}
          onBlur={() => {
            field.handleBlur();
            // Mark field as blurred in validation mode
            if (validationModeContext) {
              validationModeContext.markFieldBlurred(field.name);
            }
          }}
          placeholder="(123) 456-7890"
          autoFocus={autoFocus}
          invalid={!!errorMessage}
          leftView={
            <CountryPicker
              withFlag
              withEmoji
              withFilter
              visible={countryPickerVisible}
              theme={DARK_THEME}
              countryCode={models.countryCode}
              onSelect={(country: Country) => {
                actions.handleCountrySelect(country);
                setCountryPickerVisible(false);
              }}
              onClose={() => setCountryPickerVisible(false)}
              renderFlagButton={() => (
                <Pressable
                  onPress={() => setCountryPickerVisible(true)}
                  className="-ml-1 mr-3 h-full flex-row items-center border-r border-border-default pr-5">
                  <Flag withFlagButton withEmoji countryCode={models.countryCode} flagSize={24} />
                  <Text variant="bodySm" className="mr-2 text-text-default">
                    {models.callingCode}
                  </Text>
                  <ChevronDown className="color-icon-default" size={14} />
                </Pressable>
              )}
            />
          }
          helperTextProps={{
            message:
              helpText ||
              `We will send you a text with a verification code.\nMessage and data rates may apply.`,
          }}
          errorMessage={errorMessage}
        />
      </View>
    </View>
  );
};
