import { useState, useCallback } from 'react'
import { View, Alert } from 'react-native'
import Sortable from 'react-native-sortables'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'

import { HighlightPreview } from './HighlightPreview'
import { UploadPlaceholder } from '../ui/upload-placeholder'
import { ActivityIndicator } from '../ui/activity-indicator'

interface Highlight {
  _id: Id<'highlights'>
  _creationTime: number
  userId: Id<'users'>
  profileId: Id<'dancers'>
  projectId: Id<'projects'>
  imageId: Id<'_storage'>
  position: number
  createdAt: string
  project: {
    _id: Id<'projects'>
    title?: string
    studio?: string
    artists?: string[]
    tourArtist?: string
    companyName?: string
    type: string
  } | null
  imageUrl: string | null
}

interface HighlightGridProps {
  highlights: Highlight[]
  onAddPress: () => void
  isLoading?: boolean
}

const MAX_HIGHLIGHTS = 10

export function HighlightGrid({
  highlights,
  onAddPress,
  isLoading = false
}: HighlightGridProps) {
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const removeHighlight = useMutation(api.highlights.removeHighlight)
  const reorderHighlights = useMutation(api.highlights.reorderHighlights)

  const canAddMore = highlights.length < MAX_HIGHLIGHTS

  const handleRemoveImage = useCallback(
    async (highlightId: Id<'highlights'>) => {
      Alert.alert(
        'Remove Highlight',
        'Are you sure you want to remove this highlight from your profile?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeHighlight({ highlightId })
              } catch (error) {
                console.error('Failed to remove highlight:', error)
                Alert.alert('Error', 'Failed to remove highlight. Please try again.')
              }
            }
          }
        ]
      )
    },
    [removeHighlight]
  )

  const handleDragEnd = useCallback(
    ({ order }: { order: <T>(data: T[]) => T[] }) => {
      if (highlights.length === 0 || !highlights[0].profileId) return

      const profileId = highlights[0].profileId

      // Build combined list (highlights + upload placeholders) in current visual order
      const remainingSlots = Math.max(0, MAX_HIGHLIGHTS - highlights.length)
      const uploads = Array.from({ length: remainingSlots }).map((_, i) => ({
        type: 'upload' as const,
        key: `upload-${i}`
      }))

      const items = [
        ...highlights.map((h) => ({
          type: 'highlight' as const,
          key: `h-${h._id}`,
          payload: h
        })),
        ...uploads
      ]

      // Let Sortable compute new child order, then filter back to highlights only
      const reordered = order(items)
      const nextHighlights = reordered
        .filter(
          (i: any): i is { type: 'highlight'; key: string; payload: Highlight } =>
            i.type === 'highlight'
        )
        .map((i) => i.payload)

      // Extract IDs in new order
      const highlightIds = nextHighlights.map((h) => h._id)

      // Call mutation to update order
      reorderHighlights({ profileId, highlightIds }).catch((error) => {
        console.error('Failed to reorder highlights:', error)
        Alert.alert('Error', 'Failed to update highlight order. Please try again.')
      })
    },
    [highlights, reorderHighlights]
  )

  // Helper to get display text for a highlight
  const getHighlightText = (highlight: Highlight) => {
    if (!highlight.project) {
      return { title: 'Untitled Project', subtitle: '' }
    }

    const { project } = highlight
    let title = project.title || 'Untitled Project'
    let subtitle = ''

    // Determine subtitle based on project type
    if (project.studio) {
      subtitle = project.studio
    } else if (project.artists && project.artists.length > 0) {
      subtitle = project.artists[0]
    } else if (project.tourArtist) {
      subtitle = project.tourArtist
    } else if (project.companyName) {
      subtitle = project.companyName
    }

    return { title, subtitle }
  }

  // Show skeleton while initial data is loading
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1 gap-4">
      <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} className="w-full">
        {containerWidth != null && (
          <Sortable.Flex
            customHandle
            gap={16}
            flexDirection="row"
            flexWrap="wrap"
            width={containerWidth}
            sortEnabled={true}
            onDragEnd={handleDragEnd}
            overflow="visible"
            bringToFrontWhenActive
            dimensionsAnimationType="layout"
            itemsLayoutTransitionMode="reorder"
            activeItemScale={1.02}
            inactiveItemOpacity={0.8}
            dragActivationDelay={150}>
            {(() => {
              const remainingSlots = Math.max(0, MAX_HIGHLIGHTS - highlights.length)
              const uploads = Array.from({ length: remainingSlots }).map((_, i) => ({
                type: 'upload' as const,
                key: `upload-${i}`
              }))
              const allItems = [
                ...highlights.map((h) => ({
                  type: 'highlight' as const,
                  key: `h-${h._id}`,
                  payload: h
                })),
                ...uploads
              ]

              let uploadIdx = 0
              const itemWidth = (containerWidth - 16) / 2

              return allItems.map((item) => {
                return (
                  <View
                    key={item.key}
                    style={{ width: itemWidth, height: 234, position: 'relative' }}>
                    {item.type === 'highlight' ? (
                      <Sortable.Handle mode="draggable">
                        {item.payload.imageUrl ? (
                          (() => {
                            const { title, subtitle } = getHighlightText(item.payload)
                            return (
                              <HighlightPreview
                                imageUrl={item.payload.imageUrl}
                                title={title}
                                subtitle={subtitle}
                                onRemove={() => handleRemoveImage(item.payload._id)}
                              />
                            )
                          })()
                        ) : (
                          <View className="bg-bg-surface h-[234px] w-full items-center justify-center rounded">
                            <ActivityIndicator size="small" />
                          </View>
                        )}
                      </Sortable.Handle>
                    ) : (
                      (() => {
                        const isFirstUpload = uploadIdx === 0
                        uploadIdx += 1
                        return (
                          <Sortable.Handle mode="fixed-order">
                            <UploadPlaceholder
                              onPress={onAddPress}
                              isActive={isFirstUpload}
                              disabled={!canAddMore}
                              height={234}
                            />
                          </Sortable.Handle>
                        )
                      })()
                    )}
                  </View>
                )
              })
            })()}
          </Sortable.Flex>
        )}
      </View>
    </View>
  )
}
