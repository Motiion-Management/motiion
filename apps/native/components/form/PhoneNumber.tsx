import { cssInterop } from 'nativewind';
import { PhoneInput as BasePhoneInput, PhoneInputProps } from 'react-native-phone-entry';

import { useFieldContext } from './context';

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
  const field = useFieldContext<string>();
  return (
    <PhoneInput
      defaultValues={{
        countryCode: 'US',
        callingCode: '+1',
        phoneNumber: '+1',
      }}
      value={field.state.value}
      onChangeText={(text) => {
        console.log('text', text);
        field.handleChange(text);
      }}
      autoFocus
      containerClassName="flex-1 bg-transparent rounded-none border-0 pb-0 m-0"
      textInputClassName={cn(
        'placeholder:text-foreground/40 flex-1 py-3 text-[17px] text-foreground border-b border-b-foreground'
      )}
      codeTextClassName="text-foreground border-0"
      flagButtonClassName="border-r-0 color-white"
    />
  );
};
