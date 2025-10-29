import React, { useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import PagerView from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';
import { TabBar } from './TabBar';
import { PillTabs } from './PillTabs';
import { TextTabs } from './TextTabs';

export type TabRoute = { key: string; title: string };

export interface PagerTabViewRef {
  setPage: (index: number) => void;
}

type TabsViewProps = {
  routes: TabRoute[];
  renderScene: (route: TabRoute) => React.ReactNode;
  initialKey?: string;
  onIndexChange?: (index: number, key: string) => void;
  disabledKeys?: string[];
  className?: string;
  /** @deprecated Use tabStyle instead */
  variant?: 'default' | 'pill';
  /** @deprecated Use tabStyle instead */
  alignment?: 'left' | 'center';
  /** Tab style: 'pill' for pill tabs, 'text' for underlined text tabs, 'animated' for scrollable animated tabs */
  tabStyle?: 'pill' | 'text' | 'animated';
  /** ClassName applied to the wrapper around the tab buttons */
  tabContainerClassName?: string;
  /** ClassName applied to each page's content wrapper */
  contentClassName?: string;
};

export const PagerTabView = forwardRef<PagerTabViewRef, TabsViewProps>(function PagerTabView(
  {
    routes,
    renderScene,
    initialKey,
    onIndexChange,
    disabledKeys = [],
    className,
    variant = 'default',
    alignment = 'left',
    tabStyle,
    tabContainerClassName,
    contentClassName,
  },
  ref
) {
  const initialIndex = Math.max(0, initialKey ? routes.findIndex((r) => r.key === initialKey) : 0);
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const indexDecimal = useSharedValue<number>(initialIndex);
  const pagerRef = useRef<React.ElementRef<typeof PagerView> | null>(null);

  const titles = useMemo(() => routes.map((r) => r.title), [routes]);
  const disabledIndices = useMemo(
    () =>
      disabledKeys.map((k) =>
        Math.max(
          0,
          routes.findIndex((r) => r.key === k)
        )
      ),
    [disabledKeys, routes]
  );
  const focusedTab = useSharedValue<string>(routes[initialIndex]?.title ?? titles[0] ?? '');

  const handleTabPress = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    pagerRef.current?.setPage?.(index);
    onIndexChange?.(index, routes[index]?.key);
  };

  // Expose setPage method via ref
  useImperativeHandle(
    ref,
    () => ({
      setPage: (index: number) => {
        if (index === activeIndex) return;
        setActiveIndex(index);
        pagerRef.current?.setPage?.(index);
        onIndexChange?.(index, routes[index]?.key);
      },
    }),
    [activeIndex, routes, onIndexChange]
  );

  // Determine which tab component to render
  const renderTabs = () => {
    // New tabStyle prop takes precedence
    if (tabStyle === 'pill') {
      return <PillTabs tabs={titles} activeIndex={activeIndex} onTabPress={handleTabPress} />;
    }
    if (tabStyle === 'text') {
      return <TextTabs tabs={titles} activeIndex={activeIndex} onTabPress={handleTabPress} />;
    }

    // Fallback to legacy TabBar for backward compatibility
    return (
      <TabBar
        focusedTab={focusedTab}
        indexDecimal={indexDecimal}
        tabNames={titles}
        activeIndex={activeIndex}
        variant={variant}
        alignment={alignment}
        onTabPress={(name) => {
          const index = routes.findIndex((r) => r.title === name);
          if (index < 0) return;
          handleTabPress(index);
        }}
      />
    );
  };

  return (
    <View className={className} style={{ flex: 1 }}>
      {/* Content layer - full height */}
      <PagerView
        ref={pagerRef}
        initialPage={initialIndex}
        style={{ flex: 1 }}
        onPageScroll={(e) => {
          const { position = 0, offset = 0 } = e.nativeEvent || {};
          indexDecimal.value = position + offset;
        }}
        onPageSelected={(e) => {
          const idx = e.nativeEvent.position ?? 0;
          if (idx !== activeIndex) {
            setActiveIndex(idx);
            onIndexChange?.(idx, routes[idx]?.key);
          }
          focusedTab.value = routes[idx]?.title ?? '';
        }}>
        {routes.map((r) => (
          <View key={r.key} className={contentClassName ?? 'flex-1'}>
            {renderScene(r)}
          </View>
        ))}
      </PagerView>

      {/* Overlay layer - tabs with fade/blur effect */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'transparent',
        }}>
        {/* Blur background */}

        <LinearGradient
          colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0)']}
          style={{ height: 40, marginTop: -8, position: 'absolute', top: 0, width: '100%' }}
          pointerEvents="none"
        />

        {/* Tab container */}
        <View className={tabContainerClassName}>{renderTabs()}</View>

        {/* Fade gradient at bottom of tabs */}
      </View>
    </View>
  );
});
