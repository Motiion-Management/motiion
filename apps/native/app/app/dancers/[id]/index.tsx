import React, { useState, useRef } from 'react';
import { View, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect } from 'expo-router';
import { useQuery } from 'convex/react';
import { captureRef } from 'react-native-view-shot';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { api } from '@packages/backend/convex/_generated/api';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { ProjectCarousel } from '~/components/dancer-profile/ProjectCarousel';
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel';
import { ProfileDetailsSheet } from '~/components/dancer-profile/ProfileDetailsSheet';
import { ProfileSheet, useProfileSheet } from '~/components/profile-sheet';
import { ProfileShareCard } from '~/components/dancer-profile/share/ProfileShareCard';
import { HeadshotShareCard } from '~/components/dancer-profile/share/HeadshotShareCard';
import { ShareBottomSheet } from '~/components/dancer-profile/share/ShareBottomSheet';
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
  const [currentHeadshotIndex, setCurrentHeadshotIndex] = useState(0);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [shareData, setShareData] = useState<{ imageUri: string; shareUrl: string } | null>(null);

  const profileShareCardRef = useRef<View>(null);
  const headshotShareCardRef = useRef<View>(null);

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

  const handleShareProfile = async () => {
    if (!id || !profileData || !profileShareCardRef.current) return;

    try {
      const imageUri = await captureRef(profileShareCardRef, {
        result: 'data-uri',
        quality: 1,
        format: 'png',
      });
      const shareUrl = `https://motiion.io/app/dancers/${id}`;
      setShareData({ imageUri, shareUrl });
      setShareSheetVisible(true);
    } catch (error) {
      console.error('Error capturing profile card:', error);
    }
  };

  const handleShareHeadshot = async () => {
    if (!id || !profileData || !headshotShareCardRef.current) return;

    try {
      const imageUri = await captureRef(headshotShareCardRef, {
        result: 'data-uri',
        quality: 1,
        format: 'png',
      });
      const shareUrl = `https://motiion.io/app/dancers/${id}`;
      setShareData({ imageUri, shareUrl });
      setShareSheetVisible(true);
    } catch (error) {
      console.error('Error capturing headshot card:', error);
    }
  };

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

  const currentHeadshotUrl = profileData.headshotUrls[currentHeadshotIndex];

  return (
    <View style={{ flex: 1 }}>
      <HeadshotCarousel
        animatedIndex={animatedIndex}
        headshotUrls={profileData.headshotUrls}
        initialIndex={0}
        onClose={snapToDefault}
        onPress={snapToDefault}
        onIndexChange={setCurrentHeadshotIndex}
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="secondary" size="icon">
                <Icon name="arrowshape.turn.up.right.fill" size={24} className="text-icon-default" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item key="profile" onSelect={handleShareProfile}>
                <DropdownMenu.ItemTitle>Share Profile</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
              <DropdownMenu.Item key="headshot" onSelect={handleShareHeadshot}>
                <DropdownMenu.ItemTitle>Share Headshot</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        }>
        <ProjectCarousel projects={profileData.recentProjects} />
        <ProfileDetailsSheet profileData={profileData} />
      </ProfileSheet>

      {/* Off-screen share cards for capture */}
      <View
        ref={profileShareCardRef}
        style={{ position: 'absolute', left: -99999, top: -99999 }}>
        <ProfileShareCard profileData={profileData} headshotUrl={currentHeadshotUrl} />
      </View>

      <View
        ref={headshotShareCardRef}
        style={{ position: 'absolute', left: -99999, top: -99999 }}>
        <HeadshotShareCard headshotUrl={currentHeadshotUrl} />
      </View>

      {/* Share Bottom Sheet */}
      {shareData && (
        <ShareBottomSheet
          visible={shareSheetVisible}
          imageUri={shareData.imageUri}
          shareUrl={shareData.shareUrl}
          onClose={() => setShareSheetVisible(false)}
        />
      )}
    </View>
  );
}
