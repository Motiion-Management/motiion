import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { OtpInput as BaseOtpInput, OtpInputProps } from 'react-native-otp-entry';

import { useFieldContext } from './context';

import { Text } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';

const MappedOtpInput = ({
  containerStyle,
  pinCodeContainerStyle,
  pinCodeTextStyle,
  focusStickStyle,
  focusedPinCodeContainerStyle,
  placeholderTextStyle,
  filledPinCodeContainerStyle,
  disabledPinCodeContainerStyle,
  ...rest
}: OtpInputProps & OtpInputProps['theme']) => {
  // const { isDarkColorScheme } = useColorScheme();
  return (
    <BaseOtpInput
      {...rest}
      // maskInputProps={{
      //   ...rest.maskInputProps,
      //   selectionColor: isDarkColorScheme ? 'white' : 'black',
      // }}
      theme={{
        ...rest.theme,
        containerStyle,
        pinCodeContainerStyle,
        pinCodeTextStyle,
        focusStickStyle,
        focusedPinCodeContainerStyle,
        placeholderTextStyle,
        filledPinCodeContainerStyle,
        disabledPinCodeContainerStyle,
      }}
    />
  );
};

const OtpInput = cssInterop(MappedOtpInput, {
  containerClassName: 'containerStyle',
  pinCodeContainerClassName: 'pinCodeContainerStyle',
  pinCodeTextClassName: 'pinCodeTextStyle',
  focusStickClassName: 'focusStickStyle',
  focusedPinCodeContainerClassName: 'focusedPinCodeContainerStyle',
  placeholderTextClassName: 'placeholderTextStyle',
  filledPinCodeContainerClassName: 'filledPinCodeContainerStyle',
  disabledPinCodeContainerClassName: 'disabledPinCodeContainerStyle',
}) as React.ComponentType<
  OtpInputProps &
    OtpInputProps['theme'] & {
      containerClassName?: string;
      pinCodeContainerClassName?: string;
      pinCodeTextClassName?: string;
      focusStickClassName?: string;
      focusedPinCodeContainerClassName?: string;
      placeholderTextClassName?: string;
      filledPinCodeContainerClassName?: string;
      disabledPinCodeContainerClassName?: string;
    }
>;

export const PhoneOTP = () => {
  const field = useFieldContext<string>();
  return (
    <View className="flex-1">
      <View className={cn('flex-row pt-2')}>
        <Text variant="labelXs" className="">
          6-Digit Code
        </Text>
      </View>
      <OtpInput
        onFilled={(otp) => {
          field.handleChange(otp);
          field.handleBlur();
        }}
        autoFocus
        containerClassName="flex-1 gap-4 px-0"
        pinCodeContainerClassName="flex-1 bg-transparent rounded-none gap-6 border-0 px-0 h-12 w-4 border-b border-b-foreground"
        pinCodeTextClassName={cn(
          'placeholder:text-text-default/40  text-body-lg text-text-default ',
          field.state.meta.isValid ? '' : 'text-text-error'
        )}
      />
    </View>
  );
};
