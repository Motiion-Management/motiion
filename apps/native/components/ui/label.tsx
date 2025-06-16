import { View } from 'react-native';

import { Text, TextProps } from './text';

import CircleAlert from '~/lib/icons/CircleAlert';

type InputLabelProps = {
  children: TextProps['children'];
  error?: boolean;
};
export const InputLabel = ({ children, error }: InputLabelProps) => {
  return (
    <View className="flex-row gap-[5px] ">
      <Text variant="labelXs" className="ml-6 uppercase text-text-low">
        {children}
      </Text>
      {error && <CircleAlert className="color-text-error" size={12} strokeWidth={2} />}
    </View>
  );
};
