import { View } from 'react-native';

import { Button } from './button';
import { Text, TextProps } from './text';

export type HelpTextProps = {
  message: TextProps['children'];
  action?: {
    label: string;
    onPress: () => void;
  };
};
export const HelpText = ({ message, action }: HelpTextProps) => {
  return (
    <View className="ml-6 flex-row items-center gap-4">
      <Text variant="bodySm" className="  text-text-low">
        {message}
      </Text>
      {action && (
        <Button size="sm" variant="plain" onPress={action.onPress}>
          <Text>{action.label}</Text>
        </Button>
      )}
    </View>
  );
};
