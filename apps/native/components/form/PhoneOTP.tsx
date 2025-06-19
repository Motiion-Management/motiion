import { View } from 'react-native';
import { useOtpInput } from 'react-native-otp-entry/dist/OtpInput/useOtpInput';

import { useFieldContext } from './context';

import { HelperTextProps } from '~/components/ui/helper-text';
import { Input } from '~/components/ui/input';

interface PhoneOTPProps {
  helperTextOpts?: HelperTextProps;
}

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

  // Format the OTP text for display with spaces between digits
  const formatOtpDisplay = (text: string) => {
    if (!text) return '';

    // Add spaces between each digit for display
    return text.split('').join(' ');
  };

  const handleTextChange = (text: string) => {
    // Remove any spaces before updating the field
    const cleanedText = text.replace(/\s/g, '');
    actions.handleTextChange(cleanedText);
  };

  return (
    <View className="flex-1 gap-4">
      <Input
        ref={models.inputRef}
        label="6-Digit Code"
        value={formatOtpDisplay(models.text)}
        onChangeText={handleTextChange}
        onFocus={actions.handleFocus}
        onBlur={actions.handleBlur}
        keyboardType="numeric"
        maxLength={11} // 6 digits + 5 spaces
        autoFocus
        errorMessage={field.state.meta.isTouched && field.state.meta.errors?.[0]?.message}
        helperTextProps={helperTextOpts}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />
    </View>
  );
};
