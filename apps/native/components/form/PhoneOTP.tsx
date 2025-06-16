import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { OtpInput as BaseOtpInput, OtpInputProps } from 'react-native-otp-entry';

import { useFieldContext } from './context';
import { ErrorText } from '../nativewindui/ErrorText';
import { HelpText, HelpTextProps } from '../nativewindui/HelpText';
import { InputLabel } from '../nativewindui/Label';

import { cn } from '~/lib/cn';

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

interface PhoneOTPProps {
  helpTextOpts?: HelpTextProps;
}

export const PhoneOTP = ({ helpTextOpts }: PhoneOTPProps) => {
  const field = useFieldContext<string>();
  return (
    <View className="flex-1 gap-4">
      <InputLabel>5-Digit Code</InputLabel>
      <OtpInput
        onFilled={(otp) => {
          field.handleChange(otp);
          field.handleBlur();
        }}
        autoFocus
        numberOfDigits={6}
        containerClassName="flex-1 gap-2 px-0"
        pinCodeContainerClassName={cn(
          'bg-surface-high border border-border-default rounded-2xl h-14 w-14 rounded-full'
        )}
        pinCodeTextClassName={cn('text-[16px] text-text-default')}
      />
      <ErrorText>{field.state.meta.errors?.[0]?.message}</ErrorText>
      {helpTextOpts && <HelpText {...helpTextOpts} />}
    </View>
  );
};
