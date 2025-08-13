import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';

import XIcon from '~/lib/icons/X';
import { cn } from '~/lib/utils';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
  className?: string;
}

export function ImagePreview({ imageUrl, onRemove, className }: ImagePreviewProps) {
  return (
    <View className={cn('relative w-full overflow-hidden rounded', className)}>
      <Image
        source={{ uri: imageUrl }}
        contentFit="cover"
        style={{ width: '100%', height: 234 }}
        onError={(error) => {
          console.error('Failed to load image:', error);
        }}
        transition={150}
      />

      {/* Remove button */}
      <Pressable
        onPress={onRemove}
        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 shadow-sm">
        <XIcon size={16} className="color-white" />
      </Pressable>
    </View>
  );
}
