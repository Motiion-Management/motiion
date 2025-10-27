import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Share } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useLocalSearchParams, router, Redirect } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as DropdownMenu from 'zeego/dropdown-menu';
import * as Haptics from 'expo-haptics';
import Transition, { useScreenAnimation } from 'react-native-screen-transitions';
import { Image as ExpoImage } from 'expo-image';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { useDancerProfileQuery } from '~/hooks/queries/useDancerProfileQuery';
import { useUser } from '~/hooks/useUser';
import { ProjectCarousel } from '~/components/dancer-profile/ProjectCarousel';
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel';
import { ProfileDetailsSheet } from '~/components/dancer-profile/ProfileDetailsSheet';
import { ProfileSheet, useProfileSheet } from '~/components/profile-sheet';
import { ProfileShareCard } from '~/components/dancer-profile/share/ProfileShareCard';
import { HeadshotShareCard } from '~/components/dancer-profile/share/HeadshotShareCard';
import { ShareBottomSheet } from '~/components/dancer-profile/share/ShareBottomSheet';
import { QRCodeDialog } from '~/components/dancer-profile/qr';
import {
  OwnProfileActions,
  DancerViewingDancerActions,
  ChoreographerViewingDancerActions,
} from '~/components/dancer-profile/action-buttons';
import { Icon } from '~/lib/icons/Icon';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';

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
  const [qrDialogVisible, setQRDialogVisible] = useState(false);

  const profileShareCardRef = useRef<View>(null);
  const headshotShareCardRef = useRef<View>(null);

  const { user: currentUser } = useUser();

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

  // Determine if viewing own profile
  const isOwnProfile = currentUser?._id === profileData?.dancer.userId;

  // Action button handlers
  const handleQRCodePress = () => {
    snapToDefault(); // Collapse sheet to 30%
    setQRDialogVisible(true); // Then open QR dialog
  };

  const handleAddPress = () => {
    // TODO: Implement add to list functionality
    console.log('Add pressed');
  };

  const handleFavoritePress = () => {
    // TODO: Implement favorite functionality
    console.log('Favorite pressed');
  };

  const handleBookPress = () => {
    // TODO: Implement booking functionality
    console.log('Book pressed');
  };

  const handleRequestPress = () => {
    // TODO: Implement request functionality
    console.log('Request pressed');
  };

  // Determine which action buttons to show
  const actionButtons = useMemo(() => {
    if (isOwnProfile) {
      return <OwnProfileActions onQRCodePress={handleQRCodePress} />;
    }

    // For now, show dancer viewing dancer actions for all non-self views
    // TODO: Determine if current user is choreographer and show ChoreographerViewingDancerActions
    const isChoreographer = false; // currentUser?.userType === 'choreographer';

    if (isChoreographer) {
      return (
        <ChoreographerViewingDancerActions
          onBookPress={handleBookPress}
          onAddPress={handleAddPress}
          onRequestPress={handleRequestPress}
        />
      );
    }

    return (
      <DancerViewingDancerActions
        onAddPress={handleAddPress}
        onFavoritePress={handleFavoritePress}
      />
    );
  }, [isOwnProfile, currentUser]);

  // Animated style for action buttons - synced with bottom sheet
  const actionButtonsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 0.5, 1], [0, 0, 1], Extrapolate.CLAMP);
    const translateY = interpolate(animatedIndex.value, [0, 1], [20, 0], Extrapolate.CLAMP);

    return {
      opacity,
      transform: [{ translateY }],
      pointerEvents: animatedIndex.value > 0.5 ? ('auto' as const) : ('none' as const),
    };
  });

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

        {/* Action buttons - positioned in top 30% overlay area */}
        <Animated.View
          style={[
            actionButtonsStyle,
            {
              position: 'absolute',
              top: '15%',
              left: 0,
              right: 0,
              zIndex: 5,
              alignItems: 'center',
            },
          ]}>
          {actionButtons}
        </Animated.View>

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

      {/* QR Code Dialog - Controlled */}
      <QRCodeDialog
        profileUrl={profileUrl}
        open={qrDialogVisible}
        onOpenChange={setQRDialogVisible}
      />
    </View>
  );
}
