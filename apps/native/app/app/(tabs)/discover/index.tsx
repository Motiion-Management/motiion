import React, { useEffect, useCallback } from 'react';
import { View, FlatList, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

import { TabScreenLayout, type TabHeaderSlot } from '~/components/layouts/TabScreenLayout';
import { Text } from '~/components/ui/text';
import { HeaderActionButton } from '~/components/ui/animated-scroll-header';
import { DancerCard } from '~/components/discover/DancerCard';
import { useDancersListQuery, type DancerCardData } from '~/hooks/queries/useDancersListQuery';

function DiscoverHeaderLeft({ scrollProgress }: TabHeaderSlot) {
  return (
    <HeaderActionButton
      scrollProgress={scrollProgress}
      iconName="bookmark"
      onPress={() => console.log('Saved')}
    />
  );
}

function DiscoverHeaderRight({ scrollProgress }: TabHeaderSlot) {
  return (
    <HeaderActionButton
      scrollProgress={scrollProgress}
      iconName="magnifyingglass"
      onPress={() => console.log('Search')}
    />
  );
}

export default function DiscoverScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { data, isLoading, isError, error, refetch } = useDancersListQuery(5);

  // Prefetch headshots for visible cards
  useEffect(() => {
    if (data?.dancers) {
      data.dancers.forEach((dancer: DancerCardData) => {
        if (dancer.headshotUrl) {
          ExpoImage.prefetch(dancer.headshotUrl).catch(() => {
            // Ignore prefetch failures
          });
        }
      });
    }
  }, [data?.dancers]);

  // Calculate initial scroll index based on number of dancers
  const getInitialScrollIndex = useCallback((dancerCount: number) => {
    if (dancerCount <= 2) return 0;
    return Math.min(2, dancerCount - 1);
  }, []);

  // Determine if paging should be enabled
  const shouldEnablePaging = (data?.dancers?.length ?? 0) >= 3;

  // Card width + gap
  const itemWidth = 366; // 350px card + 16px gap

  // Calculate content padding to center cards
  const contentPadding = (screenWidth - 350) / 2;

  const renderItem = ({ item }: { item: DancerCardData }) => (
    <View style={{ marginRight: 16 }}>
      <DancerCard dancer={item} />
    </View>
  );

  const keyExtractor = (item: DancerCardData) => item._id;

  const getItemLayout = (_: any, index: number) => ({
    length: itemWidth,
    offset: itemWidth * index,
    index,
  });

  return (
    <TabScreenLayout
      header={{
        left: DiscoverHeaderLeft,
        middle: 'Discover',
        right: DiscoverHeaderRight,
      }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 16, opacity: 0.6 }}>Loading dancers...</Text>
          </View>
        ) : isError ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <Text variant="header5" style={{ marginBottom: 8, textAlign: 'center' }}>
              Unable to Load Dancers
            </Text>
            <Text style={{ marginBottom: 16, opacity: 0.6, textAlign: 'center' }}>
              {error?.message || 'Something went wrong. Please try again.'}
            </Text>
            <Text
              onPress={() => refetch()}
              style={{ color: '#007AFF', fontWeight: '600' }}>
              Try Again
            </Text>
          </View>
        ) : !data?.dancers || data.dancers.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <Text variant="header5" style={{ marginBottom: 8, textAlign: 'center' }}>
              No Dancers Yet
            </Text>
            <Text style={{ opacity: 0.6, textAlign: 'center' }}>
              Check back soon to discover dancers in your area.
            </Text>
          </View>
        ) : (
          <FlatList
            data={data.dancers}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            horizontal
            pagingEnabled={shouldEnablePaging}
            snapToInterval={shouldEnablePaging ? itemWidth : undefined}
            decelerationRate="fast"
            initialScrollIndex={getInitialScrollIndex(data.dancers.length)}
            getItemLayout={getItemLayout}
            contentContainerStyle={{ paddingHorizontal: contentPadding }}
            showsHorizontalScrollIndicator={false}
            // Future: Add pagination support
            // onEndReached={() => loadMore()}
            // onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </TabScreenLayout>
  );
}
