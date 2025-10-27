import React from 'react';
import { Text, Platform, Pressable, FlatList, useWindowDimensions, View } from 'react-native';
import Reanimated, {
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  scrollTo,
  runOnUI,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { TabIndicator } from './TabIndicator';
import { useMeasureFlatListTabsLayout } from './use-measure-flat-list-tabs-layout';

// pinterest-navigation-between-boards-animation 🔽 (API + behavior mirrored exactly)

const TAB_BAR_HORIZONTAL_PADDING = 16;
const TAB_BAR_GAP = 24;

// Minimal local type definitions matching react-native-collapsible-tab-view
type TabName = string;
type Props = {
  focusedTab: SharedValue<TabName>;
  indexDecimal: SharedValue<number>;
  onTabPress: (name: TabName) => void;
  tabNames: TabName[];
  activeIndex: number;
  variant?: 'default' | 'pill';
  alignment?: 'left' | 'center';
};

export function TabBar({
  focusedTab,
  indexDecimal,
  onTabPress,
  tabNames,
  activeIndex,
  variant = 'default',
  alignment = 'left',
}: Props) {
  const { width: tabWidth } = useWindowDimensions();

  const listAnimatedRef = useAnimatedRef<FlatList>();
  const tabBarOffsetX = useSharedValue(0);
  const pressStartIndex = useSharedValue<number>(0);
  const pressEndIndex = useSharedValue<number | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      tabBarOffsetX.value = event.contentOffset.x;
    },
  });

  const { tabWidths, tabOffsets } = useMeasureFlatListTabsLayout({
    tabsLength: tabNames.length,
    sidePadding: TAB_BAR_HORIZONTAL_PADDING,
    gap: TAB_BAR_GAP,
  });

  useDerivedValue(() => {
    'worklet';
    const tabsCenter = tabNames.map(
      (_, index) => tabOffsets.value[index] + tabWidths.value[index] / 2
    );
    const firstTabIndexCanBeCentered = tabNames.findIndex(
      (_, index) => tabsCenter[index] > tabWidth / 2
    );
    const outputRange = tabsCenter.map((center, index) => {
      if (index < firstTabIndexCanBeCentered) {
        return 0;
      }
      return center - tabWidth / 2;
    });

    if (pressEndIndex.value !== null) {
      const startIndex = pressStartIndex.value;
      const targetIndex = pressEndIndex.value;
      const inputRange = [startIndex, targetIndex];
      const output = [outputRange[startIndex], outputRange[targetIndex]];
      const offsetX = interpolate(indexDecimal.value, inputRange, output);
      scrollTo(listAnimatedRef, offsetX, 0, false);
      if (indexDecimal.value === targetIndex) {
        pressEndIndex.value = null;
      }
    } else {
      const offsetX = interpolate(
        indexDecimal.value,
        Object.keys(tabNames).map(Number),
        outputRange
      );
      scrollTo(listAnimatedRef, offsetX, 0, false);
    }
  });

  const _renderItem = ({ item, index }: { item: TabName; index: number }) => {
    const onPress = () => {
      runOnUI(() => {
        'worklet';
        pressEndIndex.value = index;
        pressStartIndex.value = indexDecimal.value;
      })();
      onTabPress(item);
    };
    const onLongPress = () => {
      onTabPress(item);
    };

    const isActive = index === activeIndex;

    if (variant === 'pill') {
      return (
        <Pressable
          key={item}
          accessibilityRole={Platform.OS === 'web' ? 'link' : 'button'}
          accessibilityState={isActive ? { selected: true } : {}}
          accessibilityLabel={item}
          onPress={onPress}
          onLongPress={onLongPress}
          className={`flex h-8 items-center justify-center rounded-2xl px-4 py-2 ${
            isActive ? 'bg-button-surface-default' : 'bg-transparent'
          }`}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            tabWidths.modify((value) => {
              'worklet';
              value[index] = width;
              return value;
            });
          }}>
          <Text
            className={`text-xs font-semibold ${isActive ? 'text-text-high' : 'text-text-low'}`}>
            {item}
          </Text>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={item}
        accessibilityRole={Platform.OS === 'web' ? 'link' : 'button'}
        accessibilityState={focusedTab.value === item ? { selected: true } : {}}
        accessibilityLabel={item}
        onPress={onPress}
        onLongPress={onLongPress}
        className="flex items-center justify-center rounded-full"
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          tabWidths.modify((value) => {
            'worklet';
            value[index] = width;
            return value;
          });
        }}>
        <Text className="text-lg font-medium text-neutral-300">{item}</Text>
      </Pressable>
    );
  };

  const flatList = (
    <Reanimated.FlatList
      ref={listAnimatedRef}
      data={tabNames}
      keyExtractor={(item) => item}
      renderItem={_renderItem}
      horizontal
      contentContainerStyle={{
        paddingHorizontal: variant === 'pill' ? 0 : TAB_BAR_HORIZONTAL_PADDING,
        gap: variant === 'pill' ? 0 : TAB_BAR_GAP,
        justifyContent: alignment === 'center' ? 'center' : 'flex-start',
      }}
      showsHorizontalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      scrollEnabled={variant === 'default'}
    />
  );

  return (
    <View className="pb-2">
      {variant === 'pill' ? (
        <View className="rounded-[20px] border border-border-low bg-surface-tint p-1">
          {flatList}
        </View>
      ) : (
        flatList
      )}
      {variant === 'default' && (
        <TabIndicator
          activeTabIndex={indexDecimal}
          tabWidths={tabWidths}
          tabOffsets={tabOffsets}
          tabBarOffsetX={tabBarOffsetX}
        />
      )}
    </View>
  );
}

// pinterest-navigation-between-boards-animation 🔼
