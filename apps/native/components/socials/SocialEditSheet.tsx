import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Icon } from '~/lib/icons/Icon';
import {
  type SocialPlatform,
  getSocialPlatformConfig,
  normalizeHandle,
  validateHandle,
} from '~/config/socialPlatforms';

interface SocialEditSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  platform: SocialPlatform;
  currentHandle?: string;
  onSave: (handle: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function SocialEditSheet({
  isOpen,
  onOpenChange,
  platform,
  currentHandle,
  onSave,
  onDelete,
}: SocialEditSheetProps) {
  const [handle, setHandle] = useState(currentHandle || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = getSocialPlatformConfig(platform);

  useEffect(() => {
    if (isOpen) {
      setHandle(currentHandle || '');
      setError(null);
    }
  }, [isOpen, currentHandle]);

  const handleSave = async () => {
    const trimmed = handle.trim();
    if (!trimmed) return;

    // Validate the handle
    if (!validateHandle(platform, trimmed)) {
      setError('Invalid format for this platform');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // Normalize the handle (add @ prefix if needed, etc.)
      const normalized = normalizeHandle(platform, trimmed);
      await onSave(normalized);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save social handle:', error);
      setError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsSaving(true);
    try {
      await onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete social handle:', error);
      setError('Failed to delete. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isEditing = !!currentHandle;
  const prefixText = config?.handlePrefix;

  return (
    <Sheet
      isOpened={isOpen}
      onIsOpenedChange={onOpenChange}
      label={isEditing ? `Edit ${config?.name}` : `Add ${config?.displayName}`}>
      <View className="gap-6 px-4 pb-8">
        {/* Description */}
        <Text variant="bodySm" className="text-text-low">
          {platform === 'whatsapp'
            ? 'Enter your phone number with country code'
            : `Enter your ${config?.name} ${prefixText ? 'username' : 'handle'}`}
        </Text>

        {/* Handle Input */}
        <View className="relative">
          {prefixText && (
            <View className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
              <Text variant="body" className="text-text-low">
                {prefixText}
              </Text>
            </View>
          )}
          <Input
            value={handle}
            onChangeText={(text) => {
              setHandle(text);
              setError(null);
            }}
            placeholder={config?.placeholder || 'Enter handle'}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={platform === 'whatsapp' ? 'phone-pad' : 'default'}
            className={prefixText ? 'pl-10' : ''}
          />
        </View>

        {/* Error message */}
        {error && (
          <Text variant="bodySm" className="text-text-error">
            {error}
          </Text>
        )}

        {/* Action Buttons */}
        <View className="gap-3">
          <Button
            variant="primary"
            onPress={handleSave}
            disabled={!handle.trim() || isSaving}
            className="w-full">
            <Text variant="body" className="text-text-on-accent font-semibold">
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </Button>

          {isEditing && onDelete && (
            <Button
              variant="secondary"
              onPress={handleDelete}
              disabled={isSaving}
              className="w-full">
              <Text variant="body" className="font-semibold text-text-default">
                Delete
              </Text>
            </Button>
          )}
        </View>
      </View>
    </Sheet>
  );
}
