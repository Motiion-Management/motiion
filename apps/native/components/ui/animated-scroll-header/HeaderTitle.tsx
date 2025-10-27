import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';

export function HeaderTitle({ title }: { title: string }) {
  return (
    <View className="items-center justify-center">
      <Text variant="header5">{title}</Text>
    </View>
  );
}
