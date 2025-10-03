import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

interface CarouselItem {
  id: string;
  imageUrl: any;
}

interface HeroCarouselProps {
  items?: CarouselItem[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32; // 16px padding on each side
const CAROUSEL_HEIGHT = 208;

export function HeroCarousel({ items = [] }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CarouselItem }) => (
      <View style={{ width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT }}>
        <Image source={item.imageUrl} className="h-full w-full rounded" resizeMode="cover" />
      </View>
    ),
    []
  );

  const renderDotIndicators = () => (
    <View className="mt-5 flex-row items-center justify-center gap-2">
      {items.map((_, index) => (
        <View
          key={index}
          className={`h-2 w-2 rounded-full ${
            index === activeIndex ? 'bg-accent' : 'bg-surface-tint'
          }`}
        />
      ))}
    </View>
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={CAROUSEL_WIDTH}
        decelerationRate="fast"
        contentContainerClassName="gap-4 pl-4"
        keyExtractor={(item) => item.id}
      />
      {renderDotIndicators()}
    </View>
  );
}
