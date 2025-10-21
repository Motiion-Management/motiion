import { View } from 'react-native'
import { Image } from 'expo-image'

import { MediaCard } from './MediaCard'

interface ImagePreviewProps {
  imageUrl: string
  onRemove: () => void
  className?: string
  height?: number
}

export function ImagePreview({
  imageUrl,
  onRemove,
  className,
  height = 234,
}: ImagePreviewProps) {
  return (
    <MediaCard onRemove={onRemove} className={className}>
      <View className="relative w-full overflow-hidden rounded">
        <Image
          source={{ uri: imageUrl }}
          contentFit="cover"
          style={{ width: '100%', height }}
          onError={(error) => {
            console.error('Failed to load image:', error)
          }}
          transition={150}
        />
      </View>
    </MediaCard>
  )
}
