import type { ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { Image, type ImageSource } from 'expo-image';

import { Icon } from '~/lib/icons/Icon';
import { cn } from '~/lib/utils';

interface PictureCardProps extends ViewProps {
  image?: ImageSource;
  aspectRatio?: number;
}

export const PictureCard = React.forwardRef<ViewRef, PictureCardProps>(
  ({ className, image, aspectRatio = 0.84, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn('overflow-hidden rounded border border-border-tint bg-transparent', className)}
        style={{ aspectRatio }}
        {...props}>
        {image ? (
          <Image source={image} contentFit="cover" style={{ width: '100%', height: '100%' }} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Icon name="photo.on.rectangle" size={28} className="text-icon-low" />
          </View>
        )}
      </View>
    );
  }
);

PictureCard.displayName = 'PictureCard';
