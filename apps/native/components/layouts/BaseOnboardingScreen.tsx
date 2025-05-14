import { Icon } from '@roninoss/icons';
import { router, Href } from 'expo-router';
import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';

export const BaseOnboardingScreen = ({
  title,
  children,
  helpText,
  nextHref,
  canProgress = false,
  secondaryActionSlot,
}: {
  title: string;
  children: React.ReactNode;
  helpText?: string;
  nextHref: Href;
  canProgress?: boolean;
  secondaryActionSlot?: React.ReactNode;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-transparent" style={{ paddingBottom: insets.bottom }}>
      <KeyboardAwareScrollView
        bottomOffset={Platform.select({ ios: 8 })}
        bounces={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pt-4 px-4 ">
        <Text variant="title1" className="">
          {title}
        </Text>
        <View className="ios:pt-4 gap-4 pt-6">
          {children}
          {helpText && (
            <View className="pt-2">
              <Text className="text-sm text-secondary-foreground" variant="body">
                {helpText}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: Platform.select({ ios: insets.bottom + 30, default: insets.bottom }),
        }}>
        <View className="flex-row items-center justify-end px-4 py-10">
          <View className="flex-1 flex-row justify-start">{secondaryActionSlot}</View>
          <Button
            disabled={canProgress}
            size="icon"
            variant="tonal"
            onPress={() => {
              if (!canProgress) {
                return;
              }
              router.push(nextHref);
            }}>
            <Icon name="chevron-right" size={16} color="#00CCB7" />
          </Button>
        </View>
      </KeyboardStickyView>
    </View>
  );
};
