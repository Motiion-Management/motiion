import { View } from 'react-native';
import { useOtpInput } from 'react-native-otp-entry/dist/OtpInput/useOtpInput';

import { useFieldContext } from './context';

import { HelperTextProps } from '~/components/ui/helper-text';
import { Input } from '~/components/ui/input';

interface PhoneOTPProps {
  helperTextOpts?: HelperTextProps;
}

// Format the OTP text for display with spaces between digits
export const formatOtpText = (text: string) => {
  if (!text) return '';

  // Add spaces between each digit for display
  return text.split('').join(' ').concat(' ');
};

export const cleanOtpText = (text: string) => {
  // Remove all spaces from the text
  return text.replace(/\s/g, '');
};

export const PhoneOTP = ({ helperTextOpts }: PhoneOTPProps) => {
  const field = useFieldContext<string>();

  const { models, actions } = useOtpInput({
    numberOfDigits: 6,
    autoFocus: true,
    type: 'numeric',
    onTextChange: (text) => {
      console.log('OTP text changed:', text);
      field.handleChange(text);
    },
    onFilled: (otp) => {
      field.handleChange(otp);
      field.handleBlur();
    },
    blurOnFilled: true,
  });

  const handleTextChange = (text: string) => {
    actions.handleTextChange(cleanOtpText(text));
  };

  return (
    <View className="flex-1 gap-4">
      <Input
        ref={models.inputRef}
        label="6-Digit Code"
        value={formatOtpText(models.text)}
        onChangeText={handleTextChange}
        onFocus={actions.handleFocus}
        onBlur={actions.handleBlur}
        keyboardType="numeric"
        maxLength={12} // 6 digits + 6 spaces
        autoFocus
        errorMessage={field.state.meta.isTouched && field.state.meta.errors?.[0]?.message}
        helperTextProps={helperTextOpts}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />
    </View>
  );
};
