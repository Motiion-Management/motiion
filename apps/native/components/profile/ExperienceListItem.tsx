import React from 'react';
import { View, TouchableOpacity, type ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';

import { Text } from '~/components/ui/text';
import ChevronRight from '~/lib/icons/ChevronRight';

export interface ExperienceItem {
  id: string;
  studio: string;
  title: string;
  image?: ImageSourcePropType;
}

interface ExperienceListItemProps {
  item: ExperienceItem;
  onPress?: () => void;
  showDivider?: boolean;
}

export function ExperienceListItem({ item, onPress, showDivider = true }: ExperienceListItemProps) {
  return (
    <View className="gap-4">
      <TouchableOpacity
        className="flex-row items-center gap-4"
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}>
        {/* Image */}
        <View className="h-12 w-12 overflow-hidden rounded bg-surface-tint">
          {item.image && (
            <Image source={item.image} contentFit="cover" style={{ width: 48, height: 48 }} />
          )}
        </View>

        {/* Content */}
        <View className="flex-1 gap-1">
          <Text variant="labelSm" className="uppercase text-text-low">
            {item.studio}
          </Text>
          <Text variant="body" className="text-text-default">
            {item.title}
          </Text>
        </View>

        {/* Chevron */}
        {onPress && (
          <View className="h-7 w-7 items-center justify-center">
            <ChevronRight className="text-icon-neutral" />
          </View>
        )}
      </TouchableOpacity>

      {/* Divider */}
      {showDivider && <View className="h-px bg-border-tint" />}
    </View>
  );
}
