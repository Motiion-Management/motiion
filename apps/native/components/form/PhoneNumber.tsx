import { Icon } from '@roninoss/icons';
import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { Flag, CountryCode } from 'react-native-country-picker-modal';
import { PhoneInput as BasePhoneInput, PhoneInputProps } from 'react-native-phone-entry';

import { useFieldContext } from './context';

import { Text } from '~/components/nativewindui/Text';
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
  return (
    <View className="flex-1">
      <View className={cn('flex-row gap-16 pt-2')}>
        <Text variant="labelXs" className="">
          Country
        </Text>
        <Text variant="labelXs" className="">
          Phone Number
        </Text>
      </View>
      <PhoneInput
        defaultValues={{
          countryCode: 'US',
          callingCode: '+1',
          phoneNumber: '+1',
        }}
        value={field.state.value.fullNumber}
        onChangeText={(text) => {
          field.handleChange({ ...field.state.value, fullNumber: text });
        }}
        autoFocus
        containerClassName="flex-1 bg-transparent rounded-none gap-6 border-0 px-0 h-12"
        textInputClassName={cn(
          'placeholder:text-foreground/40 flex-1 py-2 text-[17px] text-foreground border-b border-b-foreground',
          field.state.meta.isValid ? '' : 'text-destructive'
        )}
        onChangeCountry={(country) => {
          field.handleChange({ ...field.state.value, countryCode: country.cca2 as CountryCode });
        }}
        flagButtonClassName="border-r-0 px-0 color-white"
        renderCustomDropdown={
          <View className="h-full flex-1 flex-row items-center gap-2 border-b border-b-foreground">
            <View className="flex-1 ">
              <Flag withFlagButton countryCode={field.state.value.countryCode} flagSize={16} />
            </View>
            <Text variant="bodySm" className="text-foreground">
              {field.state.value.countryCode}
            </Text>
            <Icon name="chevron-down" size={16} color="foreground" />
          </View>
        }
      />
    </View>
  );
};
