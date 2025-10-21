import { ReactNode, useState } from 'react'
import { View } from 'react-native'
import Sortable from 'react-native-sortables'

interface SortableGridProps<T> {
  items: T[]
  itemKey: (item: T) => string
  renderItem: (item: T, index: number, width: number) => ReactNode
  columns?: number
  gap?: number
  itemHeight: number
  sortEnabled?: boolean
  onReorder?: (items: T[]) => void
  onReorderFailed?: () => void
}

export function SortableGrid<T>({
  items,
  itemKey,
  renderItem,
  columns = 2,
  gap = 16,
  itemHeight,
  sortEnabled = true,
  onReorder,
  onReorderFailed,
}: SortableGridProps<T>) {
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  const handleDragEnd = ({ order }: { order: <U>(data: U[]) => U[] }) => {
    if (!onReorder) return

    const reordered = order(items)
    onReorder(reordered)
  }

  if (containerWidth === null) {
    return (
      <View
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        className="w-full"
      />
    )
  }

  const itemWidth = (containerWidth - gap * (columns - 1)) / columns

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} className="w-full">
      <Sortable.Flex
        customHandle
        gap={gap}
        flexDirection="row"
        flexWrap="wrap"
        width={containerWidth}
        sortEnabled={sortEnabled}
        onDragEnd={handleDragEnd}
        overflow="visible"
        bringToFrontWhenActive
        dimensionsAnimationType="layout"
        itemsLayoutTransitionMode="reorder"
        activeItemScale={1.02}
        inactiveItemOpacity={0.8}
        dragActivationDelay={150}>
        {items.map((item, index) => (
          <View
            key={itemKey(item)}
            style={{ width: itemWidth, height: itemHeight, position: 'relative' }}>
            {renderItem(item, index, itemWidth)}
          </View>
        ))}
      </Sortable.Flex>
    </View>
  )
}
