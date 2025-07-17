import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { Text } from '../ui/text';

import XIcon from '~/lib/icons/X';
import { cn } from '~/lib/utils';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
  className?: string;
}

export function ImagePreview({ imageUrl, onRemove, className }: ImagePreviewProps) {
  console.log({ imageUrl });
  return (
    <View className={cn('relative h-[234px] w-full', className)}>
      <Text className="mb-2 text-sm font-semibold">{imageUrl}</Text>
      <Image
        source={{ uri: imageUrl }}
        className="h-full w-full rounded"
        contentFit="cover"
        transition={200}
        onError={(error) => {
          console.error('Failed to load image:', error);
        }}
      />

      {/* Remove button */}
      {/* <Pressable */}
      {/*   onPress={onRemove} */}
      {/*   className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 shadow-sm"> */}
      {/*   <XIcon size={16} className="color-white" /> */}
      {/* </Pressable> */}
    </View>
  );
}
