import React, { useState } from 'react';
import { View, Image, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Text } from '~/components/ui/text';
import { Icon } from '~/lib/icons/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../ui/button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeadshotCarouselProps {
  headshotUrls: Array<string>;
  initialIndex?: number;
  onSheetOpen: () => void;
  isSheetOpen: boolean;
}

export function HeadshotCarousel({
  headshotUrls,
  initialIndex = 0,
  onSheetOpen,
  isSheetOpen,
}: HeadshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (headshotUrls.length === 0) return null;

  return (
    <View className="absolute top-0 z-10 h-screen w-screen">
      {/* Carousel */}
      <Carousel
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        data={headshotUrls}
        defaultIndex={initialIndex}
        onSnapToItem={setCurrentIndex}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <Image
              source={{ uri: item }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {/* Title */}
      <View className="absolute left-0 right-0 top-0 items-center" pointerEvents="none">
        <SafeAreaView className="pt-4">
          <Text variant="header5">Headshots</Text>
        </SafeAreaView>
      </View>

      {/* Bottom controls */}
      <View className="absolute bottom-4 left-4 right-4">
        <View className="flex-row items-center px-4 pb-4" pointerEvents="box-none">
          {/* Close button */}
          <Button variant="secondary" size="icon" onPress={onSheetOpen}>
            <Icon name="arrow.up.to.line" size={24} className="text-icon-default" />
          </Button>

          {/* Stepper indicator */}
          <View className="flex-1 items-center">
            <View className="rounded-full border-border-tint bg-surface-tint p-2">
              {headshotUrls.length > 1 && (
                <View className="flex-row gap-2">
                  {headshotUrls.map((_, index) => (
                    <View
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Spacer for symmetry */}
          <Button variant="secondary" size="icon" onPress={onSheetOpen}>
            <Icon name="arrowshape.turn.up.right.fill" size={24} className="text-icon-default" />
          </Button>
        </View>
      </View>
    </View>
  );
}
