import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect, Link } from 'expo-router';
import { useQuery } from 'convex/react';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { ProfileActionButtons } from '~/components/dancer-profile/ProfileActionButtons';
import { ProjectCarousel } from '~/components/dancer-profile/ProjectCarousel';
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel';
import { ProfileDetailsSheet } from '~/components/dancer-profile/ProfileDetailsSheet';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Icon } from '~/lib/icons/Icon';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { TypecastDetails } from '~/components/dancer-profile/TypecastDetails';

function TopBar({ onExpandIntent }: { onExpandIntent: () => void }) {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Navigate to home/default screen
      router.replace('/');
    }
  };
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 8,
        }}>
        {/* Close button (left) */}
        <Button onPress={handleClose} variant="tertiary">
          <Icon name="xmark" size={20} className="text-icon-default" />
        </Button>

        {/* Profile Details button (right) */}
        <Button variant="tertiary" onPress={onExpandIntent}>
          <Icon name="person.text.rectangle" size={28} className="text-icon-default" />
        </Button>
      </View>
    </SafeAreaView>
  );
}

function CustomHandle({ animatedIndex }: { animatedIndex: SharedValue<number> }) {
  const handleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 1], [0, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  return (
    <Animated.View style={[handleStyle]} className="items-center pb-2 pt-3">
      <View className="h-1 w-10 rounded-full bg-gray-400" />
    </Animated.View>
  );
}

function AnimatedSheetBackground({
  animatedIndex,
  screenHeight,
  headerHeight,
}: {
  animatedIndex: SharedValue<number>;
  screenHeight: number;
  headerHeight: number;
}) {
  const backgroundStyle = useAnimatedStyle(() => {
    // Horizontal margins: 24px at index 0 → 0px at index 1
    const marginHorizontal = interpolate(animatedIndex.value, [0, 1], [12, 0], Extrapolate.CLAMP);
    const marginTop = interpolate(animatedIndex.value, [0, 1], [6, 0], Extrapolate.CLAMP);

    // Height: dynamic based on header content → full height at index 1
    const height = interpolate(
      animatedIndex.value,
      [0, 1],
      [headerHeight, screenHeight],
      Extrapolate.CLAMP
    );

    // Top border radius: half of header height (fully rounds pill) → rounded-3xl (24px)
    const borderTopRadius = interpolate(
      animatedIndex.value,
      [0, 1],
      [headerHeight / 2, 24],
      Extrapolate.CLAMP
    );

    // Bottom border radius: half of header height (matches top for consistent pill shape)
    const borderBottomRadius = headerHeight / 2;

    // Shadow opacity: visible at index 0, fades out at index 1
    const shadowOpacity = interpolate(animatedIndex.value, [0, 1], [0.15, 0], Extrapolate.CLAMP);

    return {
      marginTop,
      marginHorizontal,
      height,
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
      borderBottomLeftRadius: borderBottomRadius,
      borderBottomRightRadius: borderBottomRadius,
      shadowOpacity,
    };
  });

  return (
    <Animated.View
      style={[
        backgroundStyle,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
          elevation: 5,
        },
      ]}
      className="bg-background-nav"
    />
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSIBLE_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function DancerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(0);
  const snapPoints = useMemo(() => ['11%', '50%', '90%'], []);
  const [headshotLoaded, setHeadshotLoaded] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(80);

  const setSheetToDefaultView = () => bottomSheetRef.current?.snapToIndex(0);
  const setSheetToExpandedView = () => bottomSheetRef.current?.snapToIndex(1);

  const toggleSheet = () =>
    animatedIndex.value
      ? bottomSheetRef.current?.snapToIndex(0)
      : bottomSheetRef.current?.snapToIndex(1);

  // Animated styles for collapsible section
  const collapsibleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 1], [1, 0], Extrapolate.CLAMP);
    const maxHeight = interpolate(
      animatedIndex.value,
      [0, 1],
      [COLLAPSIBLE_HEIGHT, 0],
      Extrapolate.CLAMP
    );
    return { opacity, maxHeight, overflow: 'hidden' };
  });

  // Animated styles for profile details content
  const profileDetailsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 1], [0, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  // Animated styles for blur background
  const blurStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 1], [0, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  // Animated styles for toggle button icons
  const arrowIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 1], [1, 0], Extrapolate.CLAMP);
    return { opacity };
  });

  const personIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 1], [0, 1], Extrapolate.CLAMP);
    return { opacity };
  });

  // Fetch profile data
  const profileData = useQuery(
    api.dancers.getDancerProfileWithDetails,
    id ? { dancerId: id as Id<'dancers'> } : 'skip'
  );

  if (profileData === undefined) {
    return null;
  }

  if (profileData === null) {
    return <Redirect href="/app/home" />;
  }

  // Wait for headshot URLs to exist
  if (profileData.headshotUrls.length === 0) {
    return null;
  }

  // Wait for first headshot image to load
  if (!headshotLoaded) {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={{ uri: profileData.headshotUrls[0] }}
          onLoad={() => setHeadshotLoaded(true)}
          style={{ width: 0, height: 0 }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Headshot Carousel - expands to full screen when sheet closes */}
      <HeadshotCarousel
        animatedIndex={animatedIndex}
        headshotUrls={profileData.headshotUrls}
        initialIndex={0}
        onClose={setSheetToDefaultView}
        onPress={setSheetToDefaultView}
      />

      {/* Top Bar */}
      <TopBar onExpandIntent={setSheetToExpandedView} />
      {/* BottomSheet with Projects */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enableOverDrag={false}
        index={0}
        animatedIndex={animatedIndex}
        enablePanDownToClose={false}
        handleComponent={() => <CustomHandle animatedIndex={animatedIndex} />}
        backgroundComponent={() => (
          <AnimatedSheetBackground
            animatedIndex={animatedIndex}
            screenHeight={SCREEN_HEIGHT}
            headerHeight={headerHeight}
          />
        )}>
        <BottomSheetView
          className="h-[90vh] pb-10"
          style={{ flex: 1, backgroundColor: 'transparent', position: 'relative' }}>
          <View className="flex-1 gap-8">
            {/* Bottomsheet header content */}
            <View
              id="profile-sheet-header"
              className="z-10 px-8 pb-4"
              onLayout={(event) => {
                const measuredHeight = event.nativeEvent.layout.height;
                setHeaderHeight(measuredHeight + 16);
              }}>
              <View className="flex-row items-center justify-between">
                {/* Left button */}
                <Button variant="secondary" size="icon" onPress={toggleSheet}>
                  <View style={{ position: 'relative', width: 24, height: 24 }}>
                    <Animated.View style={[arrowIconStyle, { position: 'absolute' }]}>
                      <Icon name="arrow.up.to.line" size={24} className="text-icon-default" />
                    </Animated.View>
                    <Animated.View style={[personIconStyle, { position: 'absolute' }]}>
                      <Icon
                        name="person.crop.square.on.square.angled.fill"
                        size={24}
                        className="text-icon-default"
                      />
                    </Animated.View>
                  </View>
                </Button>

                {/* Center content */}
                <View className="flex-1 items-center">
                  <Text variant="header3">{profileData.dancer.displayName}</Text>
                  <Text variant="body">
                    {profileData.dancer?.location?.city}, {profileData.dancer?.location?.state}
                  </Text>
                </View>

                {/* Right button */}
                <Button variant="secondary" size="icon" onPress={() => { }}>
                  <Icon
                    name="arrowshape.turn.up.right.fill"
                    size={24}
                    className="text-icon-default"
                  />
                </Button>
              </View>
            </View>
            <ProjectCarousel projects={profileData.recentProjects} />

            {/* Profile Details - fades in when reaching index 1 */}
            <ProfileDetailsSheet
              profileData={profileData}
              onCollapseIntent={setSheetToDefaultView}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
