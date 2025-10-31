import React from 'react';
import { View } from 'react-native';
import { type ProfileSheetHandleProps } from './types';

export function ProfileSheetHandle({ animatedIndex }: ProfileSheetHandleProps) {
  return (
    <View className="items-center pb-2 pt-3">
      <View className="h-1 w-10 rounded-full bg-gray-400" />
    </View>
  );
}
