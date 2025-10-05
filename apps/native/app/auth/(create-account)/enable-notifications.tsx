import React, { useState, useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import * as Device from 'expo-device';

import { BaseAuthScreen } from '~/components/layouts/BaseAuthScreen';
import { Text } from '~/components/ui/text';
import {
  requestNotificationPermissions,
  registerForPushNotifications,
} from '~/utils/notifications';
import { useMutation, useConvex } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { Button } from '~/components/ui/button';

type UserReadyState = 'polling' | 'ready' | 'timeout';

const USER_POLL_MAX_WAIT_MS = 5000;
const USER_POLL_INTERVAL_MS = 200;
const USER_POLL_CHECK_INTERVAL_MS = 100;

export default function EnableNotificationsScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [userReadyState, setUserReadyState] = useState<UserReadyState>('polling');
  const [error, setError] = useState<string | null>(null);
  const userReadyStateRef = useRef<UserReadyState>('polling');

  const { user } = useUser();
  const convex = useConvex();
  const savePushToken = useMutation(api.users.users.saveMyPushToken);

  // Start polling for user existence on mount
  useEffect(() => {
    if (!user?.id) return;

    const pollForUser = async () => {
      const startTime = Date.now();

      console.log('🔍 Polling for user existence in Convex...');

      while (Date.now() - startTime < USER_POLL_MAX_WAIT_MS) {
        try {
          const exists = await convex.query(api.users.users.userExistsByTokenId, {
            tokenId: user.id,
          });

          if (exists) {
            const elapsed = Date.now() - startTime;
            console.log(`✅ User ready after ${elapsed}ms`);
            userReadyStateRef.current = 'ready';
            setUserReadyState('ready');
            return;
          }
        } catch (error) {
          console.warn('⚠️ Error checking user existence:', error);
        }

        await new Promise((resolve) => setTimeout(resolve, USER_POLL_INTERVAL_MS));
      }

      console.error('⏱️ User creation timeout after 5s');
      userReadyStateRef.current = 'timeout';
      setUserReadyState('timeout');
    };

    pollForUser();
  }, [user?.id, convex]);

  // Helper to wait for user to be ready
  async function waitForUserReady(): Promise<boolean> {
    // If already ready, return immediately
    if (userReadyStateRef.current === 'ready') return true;
    if (userReadyStateRef.current === 'timeout') return false;

    // Wait for polling to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (userReadyStateRef.current === 'ready') {
          clearInterval(checkInterval);
          resolve(true);
        } else if (userReadyStateRef.current === 'timeout') {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, USER_POLL_CHECK_INTERVAL_MS);
    });
  }

  async function onEnable() {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('📱 Requesting notification permissions...');
      const status = await requestNotificationPermissions();

      if (status === 'granted') {
        console.log('✅ Notification permissions granted');

        // Skip token registration on simulator (it hangs indefinitely)
        if (!Device.isDevice) {
          console.log('📱 Running on simulator - skipping push token registration');
        } else {
          // Only attempt token registration on real devices
          try {
            const token = await registerForPushNotifications();
            if (token) {
              console.log('🔔 Push token obtained, saving to backend...');
              await savePushToken({ token, platform: Platform.OS as 'ios' | 'android' });
              console.log('✅ Push token saved successfully');
            } else {
              console.warn('⚠️ Could not obtain push token');
            }
          } catch (tokenError: any) {
            console.warn('⚠️ Failed to register push token:', tokenError.message || tokenError);
            console.warn('Continuing with onboarding (notifications can be enabled later)');
          }
        }
      } else {
        console.log('ℹ️ Notification permissions not granted, skipping token registration');
      }
    } catch (permissionError: any) {
      // Non-fatal: log and continue
      console.warn(
        '⚠️ Error during notification setup:',
        permissionError.message || permissionError
      );
    }

    // Wait for user to exist in Convex (usually instant if user read the screen)
    console.log('⏳ Ensuring account is ready...');
    const userReady = await waitForUserReady();
    if (!userReady) {
      setError('Account setup timed out. Please contact support.');
      setIsProcessing(false);
      return;
    }

    console.log('✅ Completing onboarding and navigating to app...');
    router.replace('/app');
  }

  async function onSkip() {
    setIsProcessing(true);
    setError(null);

    // Wait for user to exist in Convex (usually instant if user read the screen)
    console.log('⏳ Ensuring account is ready...');
    const userReady = await waitForUserReady();
    if (!userReady) {
      setError('Account setup timed out. Please contact support.');
      setIsProcessing(false);
      return;
    }

    console.log('⏭️ Skipping notifications, completing onboarding...');
    router.replace('/app');
  }

  return (
    <BaseAuthScreen
      title="Enable notifications"
      description="Stay up to date with important updates. You can change this anytime in Settings."
      canProgress={!isProcessing}
      bottomActionSlot={
        <View className="flex-1 gap-4">
          {error && <Text className="text-center text-sm text-text-error">{error}</Text>}
          <Button size="lg" onPress={onEnable} disabled={isProcessing}>
            <Text className="">Enable Notifications</Text>
          </Button>
          <Button variant="secondary" onPress={onSkip} disabled={isProcessing}>
            <Text className="">Disable</Text>
          </Button>
        </View>
      }>
      <View className="flex-1 items-center justify-center">
        <Image
          style={{ width: 336, height: 290 }}
          source={require('../../../assets/images/onboarding/notification-graphic.png')}
        />
      </View>
    </BaseAuthScreen>
  );
}
