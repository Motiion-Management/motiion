import React from 'react';
import { View, Image } from 'react-native';
import { type DancerProfileData } from '@packages/backend/convex/dancers';
import { Text } from '~/components/ui/text';
import { TypecastDetails } from '../TypecastDetails';
import { MotiionLogo } from '~/lib/icons/MotiionLogo';

interface ProfileShareCardProps {
  profileData: DancerProfileData;
  headshotUrl: string;
}

// Instagram Story dimensions: 1080x1920
const CARD_WIDTH = 380;
const CARD_HEIGHT = 280;
const HEADSHOT_WIDTH = CARD_WIDTH / 2.5;

export function ProfileShareCard({ profileData, headshotUrl }: ProfileShareCardProps) {
  const { dancer } = profileData;
  const displayName = dancer.displayName || 'Dancer';
  const location =
    dancer.location?.city && dancer.location?.state
      ? `${dancer.location.city}, ${dancer.location.state}`
      : undefined;

  return (
    <View
      className="flex-row bg-background-utility-dark"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
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
      <View className="flex-1 justify-start gap-1 p-6">
        {/* Top Section - Profile Info */}
        <View className="flex-row justify-between">
          <Text variant="labelSm">Dancer</Text>
          <MotiionLogo height={12} />
        </View>

        <Text variant="header2" className="">
          {displayName} Hebert
        </Text>

        {location && <Text variant="body">{location}</Text>}

        {/* Typecast Details */}
        {dancer.attributes && (
          <View className="flex-1 justify-end">
            <TypecastDetails dancer={dancer} variant="share-card" />
          </View>
        )}

        {/* Bottom Section - Logo */}
      </View>
    </View>
  );
}
