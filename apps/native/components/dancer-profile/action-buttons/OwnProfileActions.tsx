import React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Icon } from '~/lib/icons/Icon';
import { Text } from '~/components/ui/text';

interface OwnProfileActionsProps {
  onQRCodePress: () => void;
}

export function OwnProfileActions({ onQRCodePress }: OwnProfileActionsProps) {
  return (
    <>
      {/* QR Code Button */}
      <View className="items-center gap-2">
        <Button
          variant="tertiary"
          size="icon"
          onPress={onQRCodePress}
          className="h-[58px] w-[58px] rounded-[46px] shadow-md">
          <Icon name="qrcode" size={28} className="text-icon-default" />
        </Button>
        <Text className="text-[10px] font-medium uppercase tracking-[0.6px] text-white">Code</Text>
      </View>
    </>
  );
}
