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
        <Button onPress={handleClose} variant="plain">
          <Icon name="xmark" size={20} className="text-icon-default" />
        </Button>

        {/* Profile Details button (right) */}
        <Button variant="plain" onPress={onExpandIntent}>
          <Icon name="person.text.rectangle" size={28} className="text-icon-default" />
        </Button>
      </View>
    </SafeAreaView>
  );
}
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSIBLE_HEIGHT = SCREEN_HEIGHT * 0.4;

export default function DancerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(0);
  const snapPoints = useMemo(() => ['40%', '100%'], []);
  const [headshotLoaded, setHeadshotLoaded] = useState(false);

  const setSheetToHeadshotsView = () => bottomSheetRef.current?.close();
  const setSheetToDefaultView = () => bottomSheetRef.current?.snapToIndex(0);
  const setSheetToExpandedView = () => bottomSheetRef.current?.snapToIndex(1);

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

  const { dancer, headshotUrls, recentProjects, allProjects, training, isOwnProfile } = profileData;

  // Wait for headshot URLs to exist
  if (headshotUrls.length === 0) {
    return null;
  }

  // Wait for first headshot image to load
  if (!headshotLoaded) {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={{ uri: headshotUrls[0] }}
          onLoad={() => setHeadshotLoaded(true)}
          style={{ width: 0, height: 0 }}
        />
      </View>
    );
  }

  return (
    <BackgroundGradientView>
      <View style={{ flex: 1 }}>
        {/* Headshot Carousel - expands to full screen when sheet closes */}
        <HeadshotCarousel
          animatedIndex={animatedIndex}
          headshotUrls={headshotUrls}
          initialIndex={0}
          onClose={setSheetToDefaultView}
          onPress={setSheetToHeadshotsView}
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
          enablePanDownToClose={true}
          handleComponent={null}
          backgroundStyle={{ backgroundColor: 'transparent' }}>
          <BottomSheetView
            className="h-[100vh]"
            style={{ flex: 1, backgroundColor: 'transparent', position: 'relative' }}>
            {/* Collapsible section - fades and collapses when reaching index 1 */}
            <Animated.View style={collapsibleStyle} className="gap-8">
              <View />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,0.99)']}
                locations={[0.0, 0.1, 0.2, 0.25]}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  zIndex: 0,
                }}
              />
              {/* Content on top of gradient */}
              <View className="z-10 px-4">
                <Text variant="header3">{dancer.displayName}</Text>
                <Text variant="body">
                  {dancer?.location?.city}, {dancer?.location?.state}
                </Text>
              </View>
              <ProjectCarousel projects={recentProjects} />
            </Animated.View>

            {/* Profile Details - fades in when reaching index 1 */}
            <BottomSheetScrollView className="relative flex-1">
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
                locations={[0.0, 0.2, 0.25, 0.4]}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  zIndex: 0,
                }}
              />
              {/* Blur background */}
              <Animated.View
                className="bg-surface-high/50"
                style={[
                  blurStyle,
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                  },
                ]}>
                <BlurView intensity={40} tint="dark" style={{ flex: 1 }} />
              </Animated.View>

              {/* Profile Details content */}
              <Animated.View style={profileDetailsStyle} className="relative z-10">
                <ProfileDetailsSheet
                  dancer={dancer}
                  recentProjects={recentProjects}
                  allProjects={allProjects}
                  training={training}
                  onCollapseIntent={setSheetToDefaultView}
                />
              </Animated.View>
            </BottomSheetScrollView>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </BackgroundGradientView>
  );
}
