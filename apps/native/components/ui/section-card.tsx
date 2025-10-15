import type { ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { View, type ViewProps, TouchableOpacity } from 'react-native';
import { Image, type ImageSource } from 'expo-image';

import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';

interface SectionCardProps extends ViewProps {
  title: string;
  count?: number;
  icon?: React.ReactNode;
  backgroundImage?: ImageSource;
  onPress?: () => void;
}

export const SectionCard = React.forwardRef<ViewRef, SectionCardProps>(
  ({ className, title, count, icon, backgroundImage, onPress, ...props }, ref) => {
    const CardContent = (
      <View
        ref={ref}
        className={cn(
          'h-[86px] flex-col justify-end rounded-lg border border-border-tint bg-surface-tint-accent p-4',
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

        <View className="relative z-10 flex-row justify-between">
          <Text variant="header5" className="text-text-default">
            {title}
          </Text>

          {icon ? (
            <View className="">{icon}</View>
          ) : count !== undefined ? (
            <Text variant="header4" className="text-center text-text-low opacity-50">
              {count}
            </Text>
          ) : null}
        </View>
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
