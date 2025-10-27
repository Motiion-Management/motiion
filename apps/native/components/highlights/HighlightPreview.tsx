import { View } from 'react-native';
import { Image } from 'expo-image';

import { MediaCard } from '../ui/media-card';

interface HighlightPreviewProps {
  imageUrl: string | null;
  title: string;
  subtitle: string;
  onRemove: () => void;
  height?: number;
}

export function HighlightPreview({
  imageUrl,
  title,
  subtitle,
  onRemove,
  height = 234,
}: HighlightPreviewProps) {
  return (
    <MediaCard onRemove={onRemove} title={title} subtitle={subtitle}>
      <View className="relative w-full overflow-hidden rounded">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            contentFit="cover"
            style={{ width: '100%', height }}
            onError={(error) => {
              console.error('Failed to load highlight image:', error);
            }}
            transition={150}
          />
        ) : (
          <View
            className="bg-bg-surface items-center justify-center"
            style={{ width: '100%', height }}
          />
        )}
      </View>
    </MediaCard>
  );
}
