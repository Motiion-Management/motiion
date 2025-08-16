import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';

import { BaseAuthScreen } from '~/components/layouts/BaseAuthScreen';
import { Text } from '~/components/ui/text';
import {
  requestNotificationPermissions,
  registerForPushNotifications,
} from '~/utils/notifications';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { Platform } from 'react-native';
import { Button } from '~/components/ui/button';

export default function EnableNotificationsScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const savePushToken = useMutation(api.users.saveMyPushToken);

  async function onEnable() {
    try {
      setIsProcessing(true);

      const status = await requestNotificationPermissions();
      if (status === 'granted') {
        // Best-effort token fetch; ok if it fails
        try {
          const token = await registerForPushNotifications();
          if (token) {
            await savePushToken({ token, platform: Platform.OS as 'ios' | 'android' });
          }
        } catch {
          console.warn('Failed to register for push notifications, but continuing onboarding.');
        }
      }

      // Done with onboarding
      router.replace('/app');
    } catch (e: any) {
      setIsProcessing(false);
    }
  }

  function onSkip() {
    router.replace('/app');
  }

  return (
    <BaseAuthScreen
      title="Enable notifications"
      description="Stay up to date with important updates. You can change this anytime in Settings."
      canProgress={!isProcessing}
      bottomActionSlot={
        <View className="flex-1 gap-4">
          <Button size="lg" onPress={onEnable} disabled={isProcessing}>
            <Text className="">Enable Notifications</Text>
          </Button>
          <Button variant="secondary" onPress={onSkip} disabled={isProcessing}>
            <Text className="">Disable</Text>
          </Button>
        </View>
      }>
      <View className="min-h-12 flex-1 gap-6"></View>
    </BaseAuthScreen>
  );
}
