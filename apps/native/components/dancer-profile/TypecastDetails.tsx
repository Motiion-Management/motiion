import React from 'react'
import { View } from 'react-native'
import { Text } from '~/components/ui/text'
import { type Doc } from '@packages/backend/convex/_generated/dataModel'

interface TypecastDetailsProps {
  dancer: Doc<'dancers'>
}

export function TypecastDetails({ dancer }: TypecastDetailsProps) {
  const { attributes } = dancer

  if (!attributes) return null

  const details = []

  if (attributes.gender) {
    details.push(attributes.gender)
  }

  if (attributes.height) {
    const { feet, inches } = attributes.height
    details.push(`${feet}'${inches}"`)
  }

  if (attributes.ethnicity && attributes.ethnicity.length > 0) {
    details.push(attributes.ethnicity.join(', '))
  }

  if (attributes.eyeColor) {
    details.push(`${attributes.eyeColor} eyes`)
  }

  if (attributes.hairColor) {
    details.push(`${attributes.hairColor} hair`)
  }

  if (details.length === 0) return null

  return (
    <View className="flex-row flex-wrap gap-x-2">
      {details.map((detail, index) => (
        <React.Fragment key={index}>
          <Text variant="bodyXs" className="text-text-low">
            {detail}
          </Text>
          {index < details.length - 1 && (
            <Text variant="bodyXs" className="text-text-low">
              •
            </Text>
          )}
        </React.Fragment>
      ))}
    </View>
  )
}
