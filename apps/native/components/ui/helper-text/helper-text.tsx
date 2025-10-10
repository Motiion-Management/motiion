import { View } from 'react-native';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export type HelperTextProps = {
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
};
export const HelperText = ({ message, action }: HelperTextProps) => {
  return (
    <View className="z-0 mx-6 flex-row items-center gap-4">
      <Text variant="bodyXs" className="text-text-low">
        {message}
      </Text>
      {action && (
        <Button size="sm" variant="tertiary" onPress={action.onPress}>
          <Text>{action.label}</Text>
        </Button>
      )}
    </View>
  );
};
