import { View } from 'react-native';
import { Image } from 'expo-image';
import Sortable from 'react-native-sortables';

import XIcon from '~/lib/icons/X';
import { cn } from '~/lib/utils';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
  className?: string;
}

export function ImagePreview({ imageUrl, onRemove, className }: ImagePreviewProps) {
  return (
    <View className={cn('relative w-full', className)}>
      <View className={'relative w-full overflow-hidden rounded'}>
        <Image
          source={{ uri: imageUrl }}
          contentFit="cover"
          style={{ width: '100%', height: 234 }}
          onError={(error) => {
            console.error('Failed to load image:', error);
          }}
          transition={150}
        />
      </View>
      {/* Remove button integrated with sortables gesture system */}
      <View className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 shadow-sm">
        <Sortable.Touchable onTap={onRemove}>
          <XIcon size={12} className="text-white" />
        </Sortable.Touchable>
      </View>
    </View>
  );
}
