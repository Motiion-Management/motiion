import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Transition, { useScreenAnimation } from 'react-native-screen-transitions';
import { Image as ExpoImage } from 'expo-image';
import { type Id } from '@packages/backend/convex/_generated/dataModel';
import { useDancerProfileQuery } from '~/hooks/queries/useDancerProfileQuery';
import { useDancerView } from '~/hooks/useDancerView';
import { useProfileShare } from '~/hooks/useProfileShare';
import { HeadshotCarousel } from '~/components/dancer-profile/HeadshotCarousel';
import { ProfileDetailsSheet } from '~/components/dancer-profile/ProfileDetailsSheet';
import { ProfileSheet, useProfileSheet } from '~/components/profile-sheet';
import { ProfileShareCard } from '~/components/dancer-profile/share/ProfileShareCard';
import { HeadshotShareCard } from '~/components/dancer-profile/share/HeadshotShareCard';
import { ShareBottomSheet } from '~/components/dancer-profile/share/ShareBottomSheet';
import { QRCodeDialog } from '~/components/dancer-profile/qr';
import { DancerProfileActions } from '~/components/dancer-profile/DancerProfileActions';
import { DancerProfileHeader } from '~/components/dancer-profile/DancerProfileHeader';
import { Icon } from '~/lib/icons/Icon';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { MotiionLogo } from '~/lib/icons/MotiionLogo';

function TopBar() {
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
            // justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 0,
          }}>
          <Button onPress={handleClose} variant="tertiary">
            <Icon name="xmark" size={20} className="text-icon-default" />
          </Button>
          <View className="mr-12 flex-1 items-center">
            <MotiionLogo />
          </View>
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
  const [qrDialogVisible, setQRDialogVisible] = useState(false);

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

  // Initialize hooks with dancer view logic and share functionality
  const { config, actions } = useDancerView({
    targetDancerId: id as Id<'dancers'>,
    targetUserId: profileData?.dancer.userId,
    onQRCodePress: () => {
      snapToDefault(); // Collapse sheet to 30%
      setQRDialogVisible(true); // Then open QR dialog
    },
    onAddPress: () => {
      // TODO: Implement add to list functionality
      console.log('Add pressed');
    },
    onFavoritePress: () => {
      // TODO: Implement favorite functionality
      console.log('Favorite pressed');
    },
    onBookPress: () => {
      // TODO: Implement booking functionality
      console.log('Book pressed');
    },
    onRequestPress: () => {
      // TODO: Implement request functionality
      console.log('Request pressed');
    },
  });

  const {
    shareProfile,
    shareHeadshot,
    shareProfileLink,
    closeShareSheet,
    shareSheetVisible,
    shareData,
    profileShareCardRef,
    headshotShareCardRef,
  } = useProfileShare({
    profileId: id as Id<'dancers'>,
    enabled: config.canShare,
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

  // Redirect if dancer doesn't exist (query resolved to null)
  if (profileQuery.isStable && profileData === null) {
    return <Redirect href="/app/home" />;
  }

  const currentHeadshotUrl = headshotUrls[currentHeadshotIndex];
  const profileUrl = `https://motiion.io/app/dancers/${id}`;

  // Get header buttons from DancerProfileHeader
  const headerButtons = DancerProfileHeader({
    config,
    toggle,
    animations,
    onShareProfile: shareProfile,
    onShareHeadshot: shareHeadshot,
    onShareProfileLink: shareProfileLink,
  });

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

        <TopBar />
        {/* Action buttons - positioned in top 30% overlay area */}
        <DancerProfileActions config={config} actions={actions} animatedIndex={animatedIndex} />

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
          leftButton={headerButtons.leftButton}
          rightButton={headerButtons.rightButton}>
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
          onClose={closeShareSheet}
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
