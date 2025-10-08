import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect, Link } from 'expo-router';
import { useQuery } from 'convex/react';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { PictureCard } from '~/components/dancer-profile/PictureCard';
import { ProfileActionButtons } from '~/components/dancer-profile/ProfileActionButtons';
import { ProjectCarousel } from '~/components/dancer-profile/ProjectCarousel';
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel';
import { ProfileDetailsSheet } from '~/components/dancer-profile/ProfileDetailsSheet';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Icon } from '~/lib/icons/Icon';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

function TopBar({
  onExpandIntent,
  onCollapseIntent,
}: {
  onExpandIntent: () => void;
  onCollapseIntent: () => void;
}) {
  const { id } = useLocalSearchParams<{ id: string }>();

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
export default function DancerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(0);
  const snapPoints = useMemo(() => ['40%', '100%'], []);
  const [headshotLoaded, setHeadshotLoaded] = useState(false);

  const setSheetToHeadshotsView = () => bottomSheetRef.current?.close();
  const setSheetToDefaultView = () => bottomSheetRef.current?.snapToIndex(0);
  const setSheetToExpandedView = () => bottomSheetRef.current?.snapToIndex(1);

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
        <TopBar onExpandIntent={setSheetToExpandedView} onCollapseIntent={setSheetToDefaultView} />
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
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.98)', 'rgba(0,0,0,0.99)']}
              locations={[0.5, 0.59, 0.6]}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 0,
              }}
            />

            {/* Project Carousel Section with gradient background */}
            <View id="collapsible" className="h-[40vh] gap-8">
              {/* Linear gradient background - transparent top to solid bottom */}

              {/* Content on top of gradient */}
              <View className="z-10 px-4">
                <Text variant="header3">{dancer.displayName}</Text>
                <Text variant="body">
                  {dancer?.location?.city}, {dancer?.location?.state}
                </Text>
              </View>
              <ProjectCarousel projects={recentProjects} />
            </View>
            <BottomSheetScrollView className="flex-1">
              <ProjectCarousel projects={recentProjects} />
              <ProjectCarousel projects={recentProjects} />
              <ProjectCarousel projects={recentProjects} />
              <ProjectCarousel projects={recentProjects} />
            </BottomSheetScrollView>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </BackgroundGradientView>
  );
}
