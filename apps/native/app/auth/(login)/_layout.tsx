import { useSignIn } from '@clerk/clerk-expo';
import { Icon } from '@roninoss/icons';
import { Stack, router, useLocalSearchParams, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function LoginLayout() {
  const { isLoaded, signIn } = useSignIn();
  const { phoneNumber: paramPhoneNumber } = useLocalSearchParams<{ phoneNumber?: string }>();
  const pathname = usePathname();
  const hasHandledTransferRef = useRef(false);

  useEffect(() => {
    // Reset transfer flag when there's no phone number param
    if (!paramPhoneNumber) {
      hasHandledTransferRef.current = false;
    }

    // Only handle transfer when we're on the login index page, not on verify-phone
    if (isLoaded && signIn && paramPhoneNumber && !hasHandledTransferRef.current && pathname === '/auth/(login)') {
      hasHandledTransferRef.current = true;
      
      const handleTransfer = async () => {
        try {
          // Create signin attempt with the transferred phone number
          const result = await signIn.create({
            identifier: paramPhoneNumber,
          });

          // Prepare the first factor verification (phone code)
          await result.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: result.supportedFirstFactors?.find(
              (factor) => factor.strategy === 'phone_code'
            )?.phoneNumberId!,
          });

          // Navigate directly to verification page without params to avoid re-triggering
          router.replace('/auth/(login)/verify-phone');
        } catch (error) {
          console.error('Error in transfer flow:', error);
          // If transfer fails, stay on login page
        }
      };

      handleTransfer();
    }
  }, [isLoaded, signIn, paramPhoneNumber, pathname]);

  return (
    <>
      <Stack.Screen options={{ ...SCREEN_OPTIONS, title: 'Sign In' }} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      />
    </>
  );
}

const SCREEN_OPTIONS = {
  headerShown: true,
  header: () => {
    return (
      <SafeAreaView>
        <View className="h-8 flex-row items-center bg-transparent px-4">
          <View className="flex-1 flex-row items-center">
            <Text variant="labelXs" color="primary" className="mr-4">
              Sign In
            </Text>
          </View>
          <Button
            variant="plain"
            size="icon"
            className="ios:px-0"
            onPress={() => {
              // Navigate back to the root with a dismiss animation
              router.dismissAll();
            }}>
            <Icon name="close" size={24} color="currentColor" />
          </Button>
        </View>
      </SafeAreaView>
    );
  },
} as const;