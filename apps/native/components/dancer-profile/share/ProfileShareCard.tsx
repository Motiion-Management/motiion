import React from 'react'
import { View, Image } from 'react-native'
import { type DancerProfileData } from '@packages/backend/convex/dancers'
import { Text } from '~/components/ui/text'
import { TypecastDetails } from '../TypecastDetails'
import { MotiionLogo } from '~/lib/icons/MotiionLogo'

interface ProfileShareCardProps {
  profileData: DancerProfileData
  headshotUrl: string
}

// Instagram Story dimensions: 1080x1920
const CARD_WIDTH = 1080
const CARD_HEIGHT = 1920
const HEADSHOT_WIDTH = CARD_WIDTH / 3

export function ProfileShareCard({ profileData, headshotUrl }: ProfileShareCardProps) {
  const { dancer } = profileData
  const displayName = dancer.displayName || 'Dancer'
  const location =
    dancer.location?.city && dancer.location?.state
      ? `${dancer.location.city}, ${dancer.location.state}`
      : undefined

  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: '#001F1A',
        flexDirection: 'row',
      }}>
      {/* Headshot - Left 1/3 */}
      <Image
        source={{ uri: headshotUrl }}
        style={{
          width: HEADSHOT_WIDTH,
          height: CARD_HEIGHT,
        }}
        resizeMode="cover"
      />

      {/* Profile Info - Right 2/3 */}
      <View
        style={{
          flex: 1,
          padding: 60,
          justifyContent: 'space-between',
        }}>
        {/* Top Section - Profile Info */}
        <View style={{ gap: 32 }}>
          <Text
            variant="labelSm"
            style={{
              color: '#6B9B8F',
              fontSize: 28,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}>
            Dancer
          </Text>

          <Text
            variant="header1"
            style={{
              color: '#FFFFFF',
              fontSize: 72,
              lineHeight: 80,
              fontWeight: '600',
            }}>
            {displayName}
          </Text>

          {location && (
            <Text
              variant="body"
              style={{
                color: '#9FB9B3',
                fontSize: 32,
                lineHeight: 40,
              }}>
              {location}
            </Text>
          )}

          {/* Typecast Details */}
          {dancer.attributes && (
            <View style={{ marginTop: 40 }}>
              <TypecastDetails dancer={dancer} />
            </View>
          )}
        </View>

        {/* Bottom Section - Logo */}
        <View style={{ alignItems: 'flex-start' }}>
          <MotiionLogo width={120} height={75} />
        </View>
      </View>
    </View>
  )
}
