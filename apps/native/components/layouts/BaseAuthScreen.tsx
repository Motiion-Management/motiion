import { Platform, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import ChevronRight from '~/lib/icons/ChevronRight';

export const BaseAuthScreen = ({
  title,
  description,
  children,
  helpText,
  canProgress = false,
  primaryAction,
  secondaryAction,
  bottomActionSlot,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  helpText?: string;
  canProgress?: boolean;
  primaryAction?: {
    onPress: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    onPress: () => void;
    text: string;
  };
  bottomActionSlot?: React.ReactNode;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <BackgroundGradientView>
      <View className="relative flex-1" style={{ paddingBottom: 0, paddingTop: insets.top + 48 }}>
        <KeyboardAwareScrollView
          bounces={false}
          disableScrollOnKeyboardHide
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-4 ">
          <View className="flex-1 justify-center">
            <Text variant="title1">{title}</Text>
            {description && (
              <Text variant="body" className="mt-6 text-text-low">
                {description}
              </Text>
            )}
            <View className="mt-8 gap-4">
              {children}
              {helpText && (
                <View className="items-center pt-2">
                  <Text className="text-text-low" variant="bodySm">
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
            opened: Platform.select({ ios: insets.bottom, default: insets.bottom }),
          }}>
          <SafeAreaView
            edges={['bottom', 'left', 'right']}
            className="absolute bottom-0 right-0 flex-row items-center justify-between gap-4 px-4 pb-2">
            {bottomActionSlot || (
              <>
                <View className="flex-1 flex-row justify-start">
                  {secondaryAction && (
                    <Button variant="tertiary" onPress={secondaryAction.onPress}>
                      <Text className="text-sm text-text-default">{secondaryAction.text}</Text>
                    </Button>
                  )}
                </View>

                {/* Continue Button */}
                <Button
                  disabled={!canProgress}
                  size="icon"
                  variant="accent"
                  onPress={() => {
                    if (!canProgress) {
                      return;
                    }
                    primaryAction?.onPress();
                  }}>
                  <ChevronRight size={20} className="text-icon-accent" />
                </Button>
              </>
            )}
          </SafeAreaView>
        </KeyboardStickyView>
      </View>
    </BackgroundGradientView>
  );
};
