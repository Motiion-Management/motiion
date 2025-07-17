import { Pressable, View, Image } from 'react-native';

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
      <Image
        src={imageUrl}
        className=" h-[234px] w-full rounded"
        onError={(error) => {
          console.error('Failed to load image:', error);
        }}
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
