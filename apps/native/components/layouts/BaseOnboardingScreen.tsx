import { Icon } from '@roninoss/icons';
import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';

export const BaseOnboardingScreen = ({
  title,
  children,
  helpText,
  canProgress = false,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  children: React.ReactNode;
  helpText?: string;
  canProgress?: boolean;
  primaryAction: {
    onPress: () => void;
  };
  secondaryAction?: {
    onPress: () => void;
    text: string;
  };
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
      <KeyboardAwareScrollView
        bottomOffset={Platform.select({ ios: 8 })}
        bounces={false}
        disableScrollOnKeyboardHide
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-4 ">
        <View className="flex-1 justify-center">
          <Text variant="title1" className="">
            {title}
          </Text>
          <View className="ios:pt-4 gap-4 pt-6">
            {children}
            {helpText && (
              <View className="pt-2">
                <Text className="text-sm text-text-low" variant="body">
                  {helpText}
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: Platform.select({ ios: insets.bottom + 30, default: insets.bottom }),
        }}>
        <View className="flex-row items-center justify-end px-4 py-10">
          <View className="flex-1 flex-row justify-start">
            {secondaryAction && (
              <Button variant="plain" onPress={secondaryAction.onPress}>
                <Text className="text-sm text-text-default">{secondaryAction.text}</Text>
              </Button>
            )}
          </View>
          <Button
            disabled={!canProgress}
            size="icon"
            variant="accent"
            onPress={() => {
              if (!canProgress) {
                return;
              }
              primaryAction.onPress();
            }}>
            <Icon name="chevron-right" size={16} color="text-icon-accent" />
          </Button>
        </View>
      </KeyboardStickyView>
    </View>
  );
};
