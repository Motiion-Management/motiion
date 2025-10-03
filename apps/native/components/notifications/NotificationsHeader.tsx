import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import ChevronLeft from '~/lib/icons/ChevronLeft';

export function NotificationsHeader() {
  const router = useRouter();

  return (
    <View className="border-b border-[rgba(255,255,255,0.1)] bg-gradient-to-b from-[rgba(255,255,255,0.2)] to-[rgba(255,255,255,0)] pb-6">
      <View className="relative flex-row items-center justify-center px-4">
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4">
          <ChevronLeft className="h-6 w-6 text-white" />
        </TouchableOpacity>

        {/* Title */}
        <Text variant="header4" className="text-white">
          Notifications
        </Text>
      </View>
    </View>
  );
}
