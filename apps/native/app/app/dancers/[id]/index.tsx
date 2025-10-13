import React, { useState } from 'react';
import { View, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { ProjectCarousel } from '~/components/dancer-profile/ProjectCarousel';
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel';
import { ProfileDetailsSheet } from '~/components/dancer-profile/ProfileDetailsSheet';
import { ProfileSheet, useProfileSheet } from '~/components/profile-sheet';
import { Icon } from '~/lib/icons/Icon';
import { Button } from '~/components/ui/button';

function TopBar({ onExpandIntent }: { onExpandIntent: () => void }) {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
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
          paddingTop: 0,
        }}>
        <Button onPress={handleClose} variant="tertiary">
          <Icon name="xmark" size={20} className="text-icon-default" />
        </Button>
        <Button variant="tertiary" onPress={onExpandIntent}>
          <Icon name="qrcode" size={28} className="text-icon-default" />
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default function DancerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [headshotLoaded, setHeadshotLoaded] = useState(false);

  const {
    bottomSheetRef,
    animatedIndex,
    snapPoints,
    headerHeight,
    setHeaderHeight,
    snapToDefault,
    snapToExpanded,
    toggle,
    animations,
  } = useProfileSheet();

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

  if (profileData.headshotUrls.length === 0) {
    return null;
  }

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
      <HeadshotCarousel
        animatedIndex={animatedIndex}
        headshotUrls={profileData.headshotUrls}
        initialIndex={0}
        onClose={snapToDefault}
        onPress={snapToDefault}
      />

      <TopBar onExpandIntent={snapToExpanded} />

      <ProfileSheet
        bottomSheetRef={bottomSheetRef}
        animatedIndex={animatedIndex}
        snapPoints={snapPoints}
        headerHeight={headerHeight}
        onHeaderLayout={setHeaderHeight}
        title={profileData.dancer.displayName || 'Dancer'}
        subtitle={
          profileData.dancer?.location?.city && profileData.dancer?.location?.state
            ? `${profileData.dancer.location.city}, ${profileData.dancer.location.state}`
            : undefined
        }
        leftButton={
          <Button variant="secondary" size="icon" onPress={toggle}>
            <View style={{ position: 'relative', width: 24, height: 24 }}>
              <Animated.View style={[animations.arrowIcon, { position: 'absolute' }]}>
                <Icon name="arrow.up.to.line" size={24} className="text-icon-default" />
              </Animated.View>
              <Animated.View style={[animations.personIcon, { position: 'absolute' }]}>
                <Icon
                  name="person.crop.square.on.square.angled.fill"
                  size={24}
                  className="text-icon-default"
                />
              </Animated.View>
            </View>
          </Button>
        }
        rightButton={
          <Button variant="secondary" size="icon" onPress={() => {}}>
            <Icon name="arrowshape.turn.up.right.fill" size={24} className="text-icon-default" />
          </Button>
        }>
        <ProjectCarousel projects={profileData.recentProjects} />
        <ProfileDetailsSheet profileData={profileData} />
      </ProfileSheet>
    </View>
  );
}
