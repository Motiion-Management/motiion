import React from 'react';
import { View } from 'react-native';

import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

interface FieldEditSheetProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  canSave: boolean;
  onSave: () => void;
  children: React.ReactNode;
}

export function FieldEditSheet({
  title,
  description,
  open,
  onClose,
  canSave,
  onSave,
  children,
}: FieldEditSheetProps) {
  return (
    <Sheet
      label={title}
      isOpened={open}
      enableDynamicSizing={false}
      snapPoints={['90%']}
      onIsOpenedChange={(isOpen) => !isOpen && onClose()}>
      {description && (
        <View className="border-b border-border-default px-4 pb-4">
          <Text variant="bodySm" className="text-text-low">
            {description}
          </Text>
        </View>
      )}

      {/* Form Content */}
      <View className="flex-1 px-4 py-6">{children}</View>

      {/* Footer */}
      <View className="flex-1 justify-end px-4 pb-4">
        <Button disabled={!canSave} size="lg" className="w-full" onPress={onSave}>
          <Text>Save</Text>
        </Button>
      </View>
    </Sheet>
  );
}
