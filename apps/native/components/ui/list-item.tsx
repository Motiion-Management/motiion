import type { ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { View, type ViewProps, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { Image, type ImageSource } from 'expo-image';

import { Text } from '~/components/ui/text';
import { Icon } from '~/lib/icons/Icon';
import { cn } from '~/lib/utils';

type ListItemVariant = 'Profile' | 'Experience' | 'Activity';

type NativeViewProps = Pick<
  ViewProps,
  | 'accessible'
  | 'accessibilityHint'
  | 'accessibilityLabel'
  | 'accessibilityRole'
  | 'className'
  | 'style'
  | 'testID'
>;

type NativeTouchableProps = Pick<
  TouchableOpacityProps,
  | 'activeOpacity'
  | 'delayLongPress'
  | 'delayPressIn'
  | 'delayPressOut'
  | 'disabled'
  | 'focusable'
  | 'hitSlop'
  | 'onBlur'
  | 'onFocus'
  | 'onLongPress'
  | 'onPressIn'
  | 'onPressOut'
  | 'pressRetentionOffset'
>;

interface BaseListItemProps extends NativeViewProps, NativeTouchableProps {
  variant: ListItemVariant;
  onPress?: TouchableOpacityProps['onPress'];
}

interface ProfileListItemProps extends BaseListItemProps {
  variant: 'Profile';
  label: string;
  avatarUrl?: string;
  name: string;
}

interface ExperienceListItemProps extends BaseListItemProps {
  variant: 'Experience';
  image?: ImageSource;
  organizer?: string;
  label?: string;
  title?: string;
  preview?: React.ReactNode;
}

interface ActivityListItemProps extends BaseListItemProps {
  variant: 'Activity';
  category: string;
  activityType?: 'Session' | 'Class' | 'Job';
  activityLabel: string;
}

type ListItemProps = ProfileListItemProps | ExperienceListItemProps | ActivityListItemProps;

export const ListItem = React.forwardRef<ViewRef, ListItemProps>(
  (
    {
      className,
      variant,
      onPress,
      style,
      testID,
      accessible,
      accessibilityHint,
      accessibilityLabel,
      accessibilityRole,
      activeOpacity,
      delayLongPress,
      delayPressIn,
      delayPressOut,
      disabled,
      focusable,
      hitSlop,
      onBlur,
      onFocus,
      onLongPress,
      onPressIn,
      onPressOut,
      pressRetentionOffset,
      ...variantProps
    },
    ref
  ) => {
    const commonViewProps = {
      style,
      testID,
      accessible,
      accessibilityHint,
      accessibilityLabel,
      accessibilityRole,
    };

    const touchableProps: NativeTouchableProps = {
      activeOpacity,
      delayLongPress,
      delayPressIn,
      delayPressOut,
      disabled,
      focusable,
      hitSlop,
      onBlur,
      onFocus,
      onLongPress,
      onPressIn,
      onPressOut,
      pressRetentionOffset,
    };

    const resolvedTouchableProps: NativeTouchableProps = {
      ...touchableProps,
      activeOpacity: activeOpacity ?? 0.7,
    };
    const Content = () => {
      if (variant === 'Experience') {
        const {
          image,
          label = '',
          organizer = label,
          title,
          preview,
        } = variantProps as ExperienceListItemProps;
        return (
          <View className="flex-col gap-4">
            <View className="flex-row gap-4">
              {image && (
                <View className="h-12 w-12 overflow-hidden rounded">
                  <Image source={image} contentFit="cover" style={{ width: 48, height: 48 }} />
                </View>
              )}
              <View className="flex-1 flex-row items-center justify-between">
                <View className="flex-1 flex-col gap-1">
                  <Text variant="labelSm" className="uppercase text-text-low">
                    {organizer}
                  </Text>
                  {preview ? (
                    <View>{preview}</View>
                  ) : (
                    <Text variant="body" className="text-text-default">
                      {title}
                    </Text>
                  )}
                </View>
                {onPress && (
                  <View className="h-7 w-7 items-center justify-center">
                    <Icon name="chevron.right" size={20} className="text-icon-default" />
                  </View>
                )}
              </View>
            </View>
            <View className="h-px w-full bg-border-tint" />
          </View>
        );
      }

      if (variant === 'Profile') {
        const { label, avatarUrl, name } = variantProps as ProfileListItemProps;
        return (
          <View className="flex-col">
            <Text variant="labelSm" className="mb-1 uppercase text-text-low">
              {label}
            </Text>
            <View className="h-px w-full bg-border-tint" />
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center gap-2">
                {avatarUrl ? (
                  <View className="h-8 w-8 overflow-hidden rounded-full border border-border-tint">
                    <Image
                      source={{ uri: avatarUrl }}
                      contentFit="cover"
                      style={{ width: 32, height: 32 }}
                    />
                  </View>
                ) : (
                  <View className="h-8 w-8 items-center justify-center rounded-full border border-border-tint bg-surface-high">
                    <Icon name="person.fill" size={16} className="text-icon-low" />
                  </View>
                )}
                <Text variant="body" className="text-text-default">
                  {name}
                </Text>
              </View>
              <Icon name="xmark" size={24} className="text-icon-low" />
            </View>
          </View>
        );
      }

      if (variant === 'Activity') {
        const {
          category,
          activityType = 'Job',
          activityLabel,
        } = variantProps as ActivityListItemProps;

        const activityColor =
          activityType === 'Session'
            ? 'text-[#cc00be]'
            : activityType === 'Class'
              ? 'text-[#00cc55]'
              : 'text-[#4fcfcf]';

        return (
          <View className="flex-col">
            <Text variant="labelSm" className="mb-1 uppercase text-text-low">
              Category
            </Text>
            <View className="h-px w-full bg-border-tint" />
            <View className="flex-col gap-2 py-3">
              <Text variant="bodySm" className="text-text-default">
                {category}
              </Text>
              <View className="flex-row items-center gap-1">
                <Icon name="arrow.turn.down.right" size={16} className="text-icon-low" />
                <Text variant="bodyLg" className={cn('font-normal', activityColor)}>
                  {activityLabel}
                </Text>
              </View>
            </View>
          </View>
        );
      }

      return null;
    };

    if (onPress) {
      return (
        <TouchableOpacity
          ref={ref}
          onPress={onPress}
          className={cn('w-full', className)}
          {...commonViewProps}
          {...resolvedTouchableProps}>
          <Content />
        </TouchableOpacity>
      );
    }

    return (
      <View
        ref={ref}
        className={cn('w-full', className)}
        {...commonViewProps}
        {...(onBlur ? { onBlur } : {})}
        {...(onFocus ? { onFocus } : {})}>
        <Content />
      </View>
    );
  }
);

ListItem.displayName = 'ListItem';
