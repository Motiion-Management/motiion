import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { OtpInput as BaseOtpInput, OtpInputProps } from 'react-native-otp-entry';

import { useFieldContext } from './context';
import { ErrorText } from '../ui/error-text';
import { HelpText, HelpTextProps } from '../ui/help-text';
import { InputLabel } from '../ui/label';

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
      <InputLabel>6-Digit Code</InputLabel>
      <OtpInput
        onFilled={(otp) => {
          field.handleChange(otp);
          field.handleBlur();
        }}
        autoFocus
        focusStickClassName="h-6"
        numberOfDigits={6}
        containerClassName="flex-1"
        pinCodeContainerClassName={cn(
          'bg-surface-high border border-border-default h-12 w-12 m-0 rounded-full'
        )}
        pinCodeTextClassName={cn('text-[16px] text-text-default')}
      />
      <ErrorText>{field.state.meta.errors?.[0]?.message}</ErrorText>
      {helpTextOpts && <HelpText {...helpTextOpts} />}
    </View>
  );
};
