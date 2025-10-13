import React from 'react'
import { View, Image } from 'react-native'
import { MotiionLogo } from '~/lib/icons/MotiionLogo'

interface HeadshotShareCardProps {
  headshotUrl: string
}

// Square dimensions for Instagram post: 1080x1080
const CARD_SIZE = 1080
const LOGO_SIZE = 80
const LOGO_PADDING = 40

export function HeadshotShareCard({ headshotUrl }: HeadshotShareCardProps) {
  return (
    <View
      style={{
        width: CARD_SIZE,
        height: CARD_SIZE,
        position: 'relative',
      }}>
      {/* Headshot Background */}
      <Image
        source={{ uri: headshotUrl }}
        style={{
          width: CARD_SIZE,
          height: CARD_SIZE,
        }}
        resizeMode="cover"
      />

      {/* Logo Overlay - Bottom Right */}
      <View
        style={{
          position: 'absolute',
          bottom: LOGO_PADDING,
          right: LOGO_PADDING,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 12,
          padding: 16,
        }}>
        <MotiionLogo width={LOGO_SIZE} height={LOGO_SIZE * 0.625} />
      </View>
    </View>
  )
}
