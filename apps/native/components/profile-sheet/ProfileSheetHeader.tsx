import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { type ProfileSheetHeaderProps } from './types';

export function ProfileSheetHeader({
  title,
  subtitle,
  leftButton,
  rightButton,
  onLayout,
}: ProfileSheetHeaderProps) {
  return (
    <View
      id="profile-sheet-header"
      className="z-10 mb-4 px-6 pb-4"
      onLayout={(event) => {
        const measuredHeight = event.nativeEvent.layout.height;
        onLayout(measuredHeight + 16);
      }}>
      <View className="flex-row items-center justify-between">
        {/* Left button slot */}
        {leftButton || <View style={{ width: 40, height: 40 }} />}

        {/* Center content */}
        <View className="flex-1 items-center">
          <Text variant="header3">{title}</Text>
          {subtitle && <Text variant="body">{subtitle}</Text>}
        </View>

        {/* Right button slot */}
        {rightButton || <View style={{ width: 40, height: 40 }} />}
      </View>
    </View>
  );
}
