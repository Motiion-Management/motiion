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
        className={cn('h-56 flex-1 rounded-lg border border-border-default shadow-sm', className)}
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
        <TouchableOpacity onPress={onPress} className="relative flex-1" disabled={!onPress}>
          <Image
            source={backgroundImage}
            className={cn('h-56 w-auto flex-1 overflow-hidden rounded-lg shadow-sm', className)}
            style={{ borderRadius: 8 }}
          />

          <View className="absolute top-0 h-full w-full flex-1 items-end justify-end p-6">
            <View className="w-full">
              <Text className="text-text-accent mb-0.5 text-xs font-medium uppercase tracking-wider">
                {label}
              </Text>
              <Text className="text-lg font-semibold text-white">{title}</Text>
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
