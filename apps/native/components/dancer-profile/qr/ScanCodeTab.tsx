import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

export function ScanCodeTab() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    // Reset scan state when component mounts
    setHasScanned(false);
  }, []);

  const parseAndNavigate = useCallback((url: string) => {
    try {
      // Supported URL patterns:
      // - https://motiion.io/app/dancers/123
      // - motiion://app/dancers/123
      // - motiion-dev://app/dancers/123

      let path: string | null = null;

      // Check for https://motiion.io URLs
      if (url.startsWith('https://motiion.io/')) {
        path = url.replace('https://motiion.io', '');
      }
      // Check for motiion:// deep links
      else if (url.startsWith('motiion://')) {
        path = url.replace('motiion:/', '');
      }
      // Check for motiion-dev:// deep links
      else if (url.startsWith('motiion-dev://')) {
        path = url.replace('motiion-dev:/', '');
      }

      if (path) {
        // Ensure path starts with /
        if (!path.startsWith('/')) {
          path = '/' + path;
        }

        // Navigate in-app
        router.push(path as Href);

        // Success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return false;
    }
  }, []);

  const handleBarCodeScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      if (hasScanned) return;

      setHasScanned(true);

      const success = parseAndNavigate(data);

      if (!success) {
        // Error haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not a valid Motiion link. Please scan a Motiion profile QR code.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setHasScanned(false);
              },
            },
          ]
        );
      }
    },
    [hasScanned, parseAndNavigate]
  );

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text variant="body" className="text-center text-text-low">
          Loading camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permission not granted yet
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Text variant="body" className="text-center text-text-default">
          Camera access is required to scan QR codes
        </Text>
        <Button variant="primary" onPress={requestPermission}>
          <Text>Grant Camera Permission</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="relative flex-1">
      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={hasScanned ? undefined : handleBarCodeScanned}
      />

      {/* Scanning Frame Overlay */}
      <View className="flex-1 items-center justify-center p-8">
        {/* Semi-transparent overlay with cutout effect */}
        <View className="absolute inset-0 bg-black/40" />

        {/* Scanning Frame */}
        <View className="z-10 aspect-square w-full max-w-[280px] rounded-3xl border-4 border-white shadow-lg" />

        {/* Instructions */}
        <View className="absolute bottom-16 left-0 right-0 items-center px-6">
          <Text variant="header5" className="text-center text-white">
            {hasScanned ? 'Processing...' : 'Position QR code within the frame'}
          </Text>
        </View>
      </View>
    </View>
  );
}
