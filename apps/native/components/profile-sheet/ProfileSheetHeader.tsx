import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '~/components/ui/text';
import { MotiionLogo } from '~/lib/icons/MotiionLogo';
import { type ProfileSheetHeaderProps } from './types';

export function ProfileSheetHeader({
  title,
  subtitle,
  agencyLogoUrl,
  leftButton,
  rightButton,
  onLayout,
}: ProfileSheetHeaderProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Reset image load state when agencyLogoUrl changes
  useEffect(() => {
    setImageLoadFailed(false);
  }, [agencyLogoUrl]);

  return (
    <View
      id="profile-sheet-header"
      className="z-10 px-8 pb-12"
      onLayout={(event) => {
        const measuredHeight = event.nativeEvent.layout.height;
        onLayout(measuredHeight);
      }}>
      <View className="flex-row items-center justify-between">
        {/* Left: Avatar with agency logo or Motiion logo */}
        <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-high">
          {agencyLogoUrl && agencyLogoUrl.trim().length > 0 && !imageLoadFailed ? (
            <Image
              source={{ uri: agencyLogoUrl }}
              style={{ width: 40, height: 40 }}
              contentFit="cover"
              onError={() => {
                setImageLoadFailed(true);
              }}
            />
          ) : (
            <View className="scale-75">
              <MotiionLogo />
            </View>
          )}
        </View>

        {/* Center-left: Title and subtitle */}
        <View className="ml-4 flex-1">
          <Text variant="header4">{title}</Text>
          {subtitle && (
            <Text variant="bodySm" className="text-text-low">
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right: Share button */}
        {rightButton || <View style={{ width: 40, height: 40 }} />}
      </View>
    </View>
  );
}
