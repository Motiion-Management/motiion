import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import XIcon from '~/lib/icons/X';
import { cn } from '~/lib/utils';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
  className?: string;
}

export function ImagePreview({ imageUrl, onRemove, className }: ImagePreviewProps) {
  return (
    <View className={cn('relative', className)}>
      <Image
        source={{ uri: imageUrl }}
        className="h-[234px] w-full rounded bg-neutral-50"
        contentFit="cover"
        transition={200}
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
