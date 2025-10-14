import React, { useCallback } from 'react';
import { View, Alert, Pressable } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Text } from '~/components/ui/text';
import { Icon } from '~/lib/icons/Icon';
import { Button } from '~/components/ui/button';

interface MyCodeTabProps {
  profileUrl: string;
}

export function MyCodeTab({ profileUrl }: MyCodeTabProps) {
  const handleCopyLink = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(profileUrl);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Link Copied', 'Profile link copied to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  }, [profileUrl]);

  return (
    <View className="flex-1 items-center justify-center gap-8 px-4 py-8">
      {/* QR Code Card */}
      <View className="items-center gap-2">
        {/* QR Code Container */}
        <View className="overflow-hidden rounded-[5px] border border-transparent bg-white p-4 shadow-lg">
          <QRCode value={profileUrl} size={159} backgroundColor="white" color="black" />
        </View>

        {/* Branding */}
        <Text variant="header3" className="text-center text-text-default">
          motiion
        </Text>
      </View>
    </View>
  );
}
