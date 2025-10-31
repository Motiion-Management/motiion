import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Icon } from '~/lib/icons/Icon';
import type { DancerCardData } from '~/hooks/queries/useDancersListQuery';

export interface DancerCardProps {
  dancer: DancerCardData;
}

/**
 * Card component for displaying dancer profile in discover carousel
 * Matches Figma design: 350x397px with image, gradient overlay, and info
 */
export function DancerCard({ dancer }: DancerCardProps) {
  const handlePress = () => {
    router.push({
      pathname: '/app/dancers/[id]',
      params: {
        id: dancer._id,
        ...(dancer.headshotUrl && { headshot: dancer.headshotUrl }),
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: 350,
        height: 397,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(21, 25, 28, 0.4)',
      }}>
      {/* Background image or placeholder */}
      {dancer.headshotUrl ? (
        <Image
          source={{ uri: dancer.headshotUrl }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: '#1a1a1a',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon name="person.fill" size={80} className="text-gray-600" />
        </View>
      )}

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          paddingHorizontal: 16,
          paddingBottom: 16,
          justifyContent: 'flex-end',
        }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/* Text content */}
          <View style={{ gap: 8, flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#ffffff',
                letterSpacing: -0.36,
                lineHeight: 21.6,
              }}>
              {dancer.displayName}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '500',
                color: '#ffffff',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                lineHeight: 12,
              }}>
              DANCER
            </Text>
          </View>

          {/* Heart button */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 24,
              backgroundColor: 'rgba(21, 25, 28, 0.08)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 7,
              elevation: 5,
            }}>
            <Icon name="heart" size={28} className="text-white" />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
