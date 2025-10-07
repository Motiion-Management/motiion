import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect, Link } from 'expo-router';
import { useQuery } from 'convex/react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
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

function TopBar() {
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
          <Icon name="xmark" size={28} className="text-icon-default" />
        </Button>

        {/* Profile Details button (right) */}
        <Link href={`/app/dancers/${id}/details`} asChild>
          <Button variant="plain">
            <Icon name="person.text.rectangle" size={28} className="text-icon-default" />
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}
export default function DancerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(0);
  // const snapPoints = useMemo(() => ['80%'], []);

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

  return (
    <BackgroundGradientView>
      <View style={{ flex: 1 }}>
        {/* Headshot Carousel - expands to full screen when sheet closes */}
        <HeadshotCarousel
          animatedIndex={animatedIndex}
          headshotUrls={headshotUrls}
          initialIndex={0}
          onClose={() => bottomSheetRef.current?.snapToIndex(0)}
          onPress={() => bottomSheetRef.current?.close()}
        />

        {/* Top Bar */}
        <TopBar />
        {/* BottomSheet with Projects */}
        <BottomSheet
          ref={bottomSheetRef}
          // snapPoints={snapPoints}
          index={0}
          animatedIndex={animatedIndex}
          enablePanDownToClose={true}
          handleComponent={null}
          backgroundStyle={{ backgroundColor: 'transparent' }}>
          <BottomSheetView style={{ flex: 0, backgroundColor: 'transparent' }}>
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
            <Pressable
              className="h-[45vh]"
              onPress={() => bottomSheetRef.current?.close()}></Pressable>
            {/* Project Carousel Section with gradient background */}
            <View className="relative h-[40vh] gap-8">
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

            {/* Transparent Spacer - Rest of sheet */}
            <View style={{ flex: 1, backgroundColor: 'transparent' }} />
          </BottomSheetView>
        </BottomSheet>
      </View>
    </BackgroundGradientView>
  );
}
