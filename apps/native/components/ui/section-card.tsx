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
          'aspect-video flex-col justify-end overflow-hidden rounded-lg p-2 shadow',
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
              }}
            />
            <View className="absolute inset-0 rounded-lg bg-white" style={{ opacity: 0.15 }} />
          </>
        )}
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-surface-overlay opacity-70" />

        <View className="align relative z-10 flex-1 justify-between">
          <View className="flex-row justify-end">
            {icon ? (
              <View className="">{icon}</View>
            ) : count !== undefined ? (
              <Text
                variant="header4"
                className="align-self-start text-center text-text-low opacity-50">
                {count}
              </Text>
            ) : null}
          </View>
          <Text variant="header5" className="text-text-default">
            {title}
          </Text>
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
