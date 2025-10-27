import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Share } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as DropdownMenu from 'zeego/dropdown-menu';
import * as Haptics from 'expo-haptics';
import Transition, { useScreenAnimation } from 'react-native-screen-transitions';
import { Image as ExpoImage } from 'expo-image';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { useDancerProfileQuery } from '~/hooks/queries/useDancerProfileQuery';
import { ProjectCarousel } from '~/components/dancer-profile/ProjectCarousel';
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel';
import { ProfileDetailsSheet } from '~/components/dancer-profile/ProfileDetailsSheet';
import { ProfileSheet, useProfileSheet } from '~/components/profile-sheet';
import { ProfileShareCard } from '~/components/dancer-profile/share/ProfileShareCard';
import { HeadshotShareCard } from '~/components/dancer-profile/share/HeadshotShareCard';
import { ShareBottomSheet } from '~/components/dancer-profile/share/ShareBottomSheet';
import { QRCodeDialog } from '~/components/dancer-profile/qr';
import { Icon } from '~/lib/icons/Icon';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';

function TopBar({ profileUrl }: { profileUrl: string }) {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  return (
    <Animated.View
      entering={FadeIn.duration(200).delay(200)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      <SafeAreaView edges={['top', 'left', 'right']}>
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
          <QRCodeDialog profileUrl={profileUrl} />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

export default function DancerScreen() {
  const { id, headshot: initialHeadshotParam } = useLocalSearchParams<{
    id: string;
    headshot?: string;
  }>();
  const initialHeadshotUrl =
    typeof initialHeadshotParam === 'string' && initialHeadshotParam.length > 0
      ? initialHeadshotParam
      : undefined;
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
    toggle,
    animations,
  } = useProfileSheet();

  // Get screen transition progress
  const screenAnimation = useScreenAnimation();

  // Animate gradient opacity based on screen transition progress
  const gradientStyle = useAnimatedStyle(() => {
    const progress = screenAnimation.value.current.progress;
    return {
      opacity: progress,
    };
  });

  // Haptic feedback for transition
  useEffect(() => {
    // Light impact when screen mounts (transition starts)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Medium impact when transition completes (~400ms matches spring settle time)
    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialHeadshotUrl) {
      ExpoImage.prefetch(initialHeadshotUrl).catch(() => {
        // Ignore cache failures; we'll fall back to runtime loading.
      });
    }
  }, [initialHeadshotUrl]);

  const profileQuery = useDancerProfileQuery(id as Id<'dancers'>);
  const profileData = profileQuery.data;

  useEffect(() => {
    if (!profileData?.headshotUrls?.length) return;

    profileData.headshotUrls.forEach((url) => {
      ExpoImage.prefetch(url).catch(() => {
        // Ignore cache failures; runtime loading will still work.
      });
    });
  }, [profileData?.headshotUrls]);

  const headshotUrls = useMemo(() => {
    if (profileData?.headshotUrls?.length) {
      return profileData.headshotUrls;
    }
    return initialHeadshotUrl ? [initialHeadshotUrl] : [];
  }, [profileData?.headshotUrls, initialHeadshotUrl]);

  useEffect(() => {
    if (currentHeadshotIndex >= headshotUrls.length && headshotUrls.length > 0) {
      setCurrentHeadshotIndex(0);
    }
  }, [currentHeadshotIndex, headshotUrls.length]);

  const handleShareProfile = async () => {
    if (!id || !profileData || !profileShareCardRef.current) return;

    // Wait for view to be fully mounted and rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const imageUri = await captureRef(profileShareCardRef, {
        result: 'tmpfile',
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

    // Wait for view to be fully mounted and rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const imageUri = await captureRef(headshotShareCardRef, {
        result: 'tmpfile',
        quality: 1,
        format: 'png',
      });

      // Share directly with native share sheet
      await Share.share({
        url: imageUri,
        message: `Check out this photo on Motiion!\n\nhttps://motiion.io/app/dancers/${id}`,
      });
    } catch (error) {
      console.error('Error sharing headshot:', error);
    }
  };

  const handleShareProfileLink = async () => {
    if (!id) return;

    try {
      const profileLink = `https://motiion.io/app/dancers/${id}`;
      await Share.share({
        message: `Check out my profile on Motiion\n\n${profileLink}`,
      });
    } catch (error) {
      console.error('Error sharing profile link:', error);
    }
  };

  // Redirect if dancer doesn't exist (query resolved to null)
  if (profileQuery.isStable && profileData === null) {
    return <Redirect href="/app/home" />;
  }

  const currentHeadshotUrl = headshotUrls[currentHeadshotIndex];
  const profileUrl = `https://motiion.io/app/dancers/${id}`;

  return (
    <View style={{ flex: 1 }}>
      {/* Animated background gradient - synced with screen transition */}
      <Animated.View
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, gradientStyle]}>
        <BackgroundGradientView>
          <View />
        </BackgroundGradientView>
      </Animated.View>

      <Transition.MaskedView style={{ flex: 1 }}>
        {headshotUrls.length > 0 ? (
          <HeadshotCarousel
            animatedIndex={animatedIndex}
            headshotUrls={headshotUrls}
            initialIndex={Math.min(currentHeadshotIndex, headshotUrls.length - 1)}
            onClose={snapToDefault}
            onPress={snapToDefault}
            onIndexChange={setCurrentHeadshotIndex}
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: 'black' }} />
        )}

        <TopBar profileUrl={profileUrl} />

        <ProfileSheet
          bottomSheetRef={bottomSheetRef}
          animatedIndex={animatedIndex}
          snapPoints={snapPoints}
          headerHeight={headerHeight}
          onHeaderLayout={setHeaderHeight}
          title={profileData?.dancer.displayName || 'Loading...'}
          subtitle={
            profileData?.dancer?.location?.city && profileData?.dancer?.location?.state
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
                  <Icon
                    name="arrowshape.turn.up.right.fill"
                    size={24}
                    className="text-icon-default"
                  />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item key="profile-card" onSelect={handleShareProfile}>
                  <DropdownMenu.ItemTitle>Send Profile Card</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item key="headshot" onSelect={handleShareHeadshot}>
                  <DropdownMenu.ItemTitle>Send this Headshot</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item key="profile-link" onSelect={handleShareProfileLink}>
                  <DropdownMenu.ItemTitle>Share Profile Link</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          }>
          {profileQuery.isError ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              className="flex-1 items-center justify-center px-6 py-12">
              <Icon name="exclamationmark.triangle.fill" size={48} className="mb-4 text-icon-low" />
              <Text variant="header5" className="mb-2 text-center">
                Unable to Load Profile
              </Text>
              <Text variant="body" className="mb-6 text-center text-text-low">
                We couldn't load this dancer's profile. Please try again.
              </Text>
              <View className="flex-row gap-3">
                <Button
                  variant="secondary"
                  onPress={() =>
                    router.canGoBack() ? router.back() : router.replace('/app/home')
                  }>
                  <Text>Go Back</Text>
                </Button>
                <Button variant="primary" onPress={() => profileQuery.refetch()}>
                  <Text>Try Again</Text>
                </Button>
              </View>
            </Animated.View>
          ) : profileQuery.isPending && !profileQuery.isStable ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="flex-1 items-center justify-center px-6 py-12">
              <Text variant="body" className="text-center text-text-low">
                Loading profile...
              </Text>
            </Animated.View>
          ) : profileData ? (
            <Animated.View entering={FadeIn.duration(300).delay(100)} style={{ flex: 1 }}>
              <ProjectCarousel projects={profileData.recentProjects} />
              <ProfileDetailsSheet profileData={profileData} />
            </Animated.View>
          ) : null}
        </ProfileSheet>
      </Transition.MaskedView>

      {/* Off-screen share cards for capture */}
      {profileData && (
        <View
          ref={profileShareCardRef}
          collapsable={false}
          pointerEvents="none"
          style={{ position: 'absolute', left: -99999, top: -99999 }}>
          <ProfileShareCard profileData={profileData} headshotUrl={currentHeadshotUrl} />
        </View>
      )}

      {currentHeadshotUrl && (
        <View
          ref={headshotShareCardRef}
          collapsable={false}
          pointerEvents="none"
          style={{ position: 'absolute', left: -99999, top: -99999 }}>
          <HeadshotShareCard headshotUrl={currentHeadshotUrl} />
        </View>
      )}

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
