import type { ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { View, type ViewProps, TouchableOpacity } from 'react-native';
import { Image, type ImageSource } from 'expo-image';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface SectionCardProps extends ViewProps {
  title: string;
  count: number;
  backgroundImage?: ImageSource;
  onPress?: () => void;
}

export const SectionCard = React.forwardRef<ViewRef, SectionCardProps>(
  ({ className, title, count, backgroundImage, onPress, ...props }, ref) => {
    const CardContent = (
      <View
        ref={ref}
        className={cn(
          'h-[86px] flex-col justify-end rounded-lg border border-[rgba(21,25,28,0.4)] p-4',
          className
        )}
        {...props}>
        {backgroundImage && (
          <>
            <Image
              source={backgroundImage}
              contentFit="cover"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 8,
              }}
            />
            <View className="absolute inset-0 rounded-lg bg-white" style={{ opacity: 0.15 }} />
          </>
        )}

        <View className="relative z-10">
          <Text variant="header6" className="text-text-default">
            {title}
          </Text>
        </View>

        <Text
          variant="header4"
          className="absolute right-5 top-2 text-center text-text-low opacity-50">
          {count}
        </Text>
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} className="flex-1" activeOpacity={0.7}>
          {CardContent}
        </TouchableOpacity>
      );
    }

    return <View className="flex-1">{CardContent}</View>;
  }
);

SectionCard.displayName = 'SectionCard';
