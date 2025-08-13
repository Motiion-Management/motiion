import type { ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { View, type ViewProps, TouchableOpacity, ImageSourcePropType, Image } from 'react-native';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface MediaCardProps extends ViewProps {
  label: string;
  title: string;
  backgroundImage?: ImageSourcePropType;
  backgroundColor?: string;
  onPress?: () => void;
}

export const MediaCard = React.forwardRef<ViewRef, MediaCardProps>(
  (
    { className, label, title, backgroundImage, backgroundColor = '#ff6b35', onPress, ...props },
    ref
  ) => {
    const CardContent = (
      <View
        ref={ref}
        className={cn('flex-1 rounded-lg border border-border-default shadow-sm', className)}
        style={{ backgroundColor: backgroundImage ? undefined : backgroundColor }}
        {...props}>
        <View className="flex-1 items-end justify-end p-6">
          <View className="w-full">
            <Text className="text-text-accent mb-0.5 text-xs font-medium uppercase tracking-wider">
              {label}
            </Text>
            <Text className="text-lg font-semibold text-white">{title}</Text>
          </View>
        </View>
      </View>
    );

    if (backgroundImage) {
      return (
        <TouchableOpacity
          onPress={onPress}
          className="relative"
          style={{ width: 177, height: 220 }}
          disabled={!onPress}>
          <Image
            source={backgroundImage}
            style={{ width: 177, height: 220, borderRadius: 8 }}
            resizeMode="cover"
          />

          <View className="absolute top-0 h-full w-full items-end justify-end p-6">
            <View className="w-full">
              <Text variant="labelXs" className="mb-0.5 text-accent">
                {label}
              </Text>
              <Text variant="header4" className="">
                {title}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} className="flex-1">
          {CardContent}
        </TouchableOpacity>
      );
    }

    return CardContent;
  }
);

MediaCard.displayName = 'MediaCard';
