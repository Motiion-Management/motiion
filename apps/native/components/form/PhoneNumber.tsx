import { Icon } from '@roninoss/icons';
import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { Flag, CountryCode } from 'react-native-country-picker-modal';
import { getCountryCallingCodeAsync } from 'react-native-country-picker-modal/lib/CountryService';
import { PhoneInput as BasePhoneInput, PhoneInputProps } from 'react-native-phone-entry';

import { useFieldContext } from './context';
import { ErrorText } from '../ui/error-text';
import { HelpText } from '../ui/help-text';
import { InputLabel } from '../ui/label';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

const MappedPhoneInput = ({
  containerStyle,
  textInputStyle,
  codeTextStyle,
  flagButtonStyle,
  dropDownImageStyle,
  enableDarkTheme,
  ...rest
}: PhoneInputProps & PhoneInputProps['theme']) => {
  const { isDarkColorScheme } = useColorScheme();
  return (
    <BasePhoneInput
      {...rest}
      maskInputProps={{
        ...rest.maskInputProps,
        selectionColor: isDarkColorScheme ? 'white' : 'black',
      }}
      theme={{
        ...rest.theme,
        containerStyle,
        textInputStyle,
        codeTextStyle,
        flagButtonStyle,
        dropDownImageStyle,
        enableDarkTheme: isDarkColorScheme || enableDarkTheme,
      }}
    />
  );
};

const PhoneInput = cssInterop(MappedPhoneInput, {
  containerClassName: 'containerStyle',
  textInputClassName: 'textInputStyle',
  codeTextClassName: 'codeTextStyle',
  flagButtonClassName: 'flagButtonStyle',
  dropDownImageClassName: 'dropDownImageStyle',
}) as React.ComponentType<
  PhoneInputProps &
    PhoneInputProps['theme'] & {
      containerClassName?: string;
      textInputClassName?: string;
      codeTextClassName?: string;
      flagButtonClassName?: string;
      dropDownImageClassName?: string;
    }
>;

export const PhoneNumber = () => {
  const field = useFieldContext<{ fullNumber: string; countryCode: CountryCode }>();

  const isError = field.state.meta.isDirty && !field.state.meta.isValid;

  return (
    <View className="flex-1 gap-4">
      <View className={cn('flex-row gap-4')}>
        <InputLabel>Area Code</InputLabel>
        <InputLabel error={isError}>Phone Number</InputLabel>
      </View>
      <PhoneInput
        defaultValues={{
          countryCode: 'US',
          callingCode: '+1',
          phoneNumber: '+1',
        }}
        isCallingCodeEditable={false}
        value={field.state.value.fullNumber}
        onChangeText={(text) => {
          field.handleChange({ ...field.state.value, fullNumber: text });
        }}
        autoFocus
        containerClassName="bg-surface-high items-center rounded-full border-border-default py-0 h-[48px]"
        textInputClassName={cn('placeholder:text-text-default/40 text-[16px] text-text-default   ')}
        onChangeCountry={async (country) => {
          const oldCountryCode = field.state.value.countryCode;
          const oldCallingCode = await getCountryCallingCodeAsync(oldCountryCode);
          const newCallingCode = await getCountryCallingCodeAsync(country.cca2);

          const newNumber = field.state.value.fullNumber.replace(oldCallingCode, newCallingCode);

          field.handleChange({
            ...field.state.value,
            fullNumber: newNumber,
            countryCode: country.cca2 as CountryCode,
          });
        }}
        flagButtonClassName="border-r-border-default px-0 color-white  basis-[30%]"
        renderCustomDropdown={
          <View className={cn('h-[48px] flex-row items-center')}>
            <Flag
              withFlagButton
              withEmoji
              countryCode={field.state.value.countryCode}
              flagSize={16}
            />
            <Text variant="bodySm" className="-ml-2 mr-1 text-text-default">
              {field.state.value.countryCode}
            </Text>
            <Icon name="chevron-down" size={16} color="text-icon-default" />
          </View>
        }
      />
      {isError && (
        <ErrorText>
          {field.state.meta.errors?.[0]?.message || 'Please enter a valid phone number.'}
        </ErrorText>
      )}
      <HelpText
        message={`We will send you a text with a verification code.\nMessage and data rates may apply.`}
      />
    </View>
  );
};
