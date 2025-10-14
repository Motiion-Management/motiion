import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';
import { MotiionLogo } from '~/lib/icons/MotiionLogo';

interface HeadshotShareCardProps {
  headshotUrl: string;
}

const MAX_WIDTH = 1080;
const LOGO_SIZE = 80;
const LOGO_PADDING = 40;

export function HeadshotShareCard({ headshotUrl }: HeadshotShareCardProps) {
  const [dimensions, setDimensions] = useState({ width: MAX_WIDTH, height: MAX_WIDTH });

  useEffect(() => {
    Image.getSize(
      headshotUrl,
      (width, height) => {
        // Calculate proportional height for max width of 1080
        const aspectRatio = height / width;
        const calculatedHeight = MAX_WIDTH * aspectRatio;
        setDimensions({ width: MAX_WIDTH, height: calculatedHeight });
      },
      (error) => {
        console.error('Error getting image size:', error);
        // Fallback to square if image size cannot be determined
        setDimensions({ width: MAX_WIDTH, height: MAX_WIDTH });
      }
    );
  }, [headshotUrl]);

  return (
    <View
      style={{
        width: dimensions.width,
        height: dimensions.height,
        position: 'relative',
      }}>
      {/* Headshot Background */}
      <Image
        source={{ uri: headshotUrl }}
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
        resizeMode="contain"
      />

      {/* Logo Overlay - Bottom Right */}
      <View
        style={{
          position: 'absolute',
          bottom: LOGO_PADDING,
          right: LOGO_PADDING,
        }}>
        <MotiionLogo width={LOGO_SIZE} height={LOGO_SIZE} />
      </View>
    </View>
  );
}
