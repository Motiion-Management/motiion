import React from 'react'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { type Doc } from '@packages/backend/convex/_generated/dataModel'

interface NameAndLocationOverlayProps {
  dancer: Doc<'dancers'>
}

export function NameAndLocationOverlay({ dancer }: NameAndLocationOverlayProps) {
  const displayName = dancer.displayName || 'Dancer'
  const workLocation = dancer.workLocation?.[0] || null

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 137,
        left: 20,
        width: 188
      }}>
      {/* Name */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: '600',
          color: 'white',
          marginBottom: 4
        }}>
        {displayName}
      </Text>

      {/* Location */}
      {workLocation && (
        <Text
          style={{
            fontSize: 16,
            color: 'white',
            opacity: 0.9
          }}>
          {workLocation}
        </Text>
      )}
    </View>
  )
}
