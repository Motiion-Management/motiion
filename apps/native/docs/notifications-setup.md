# Push Notifications Implementation Guide

## Overview

This guide covers implementing push notifications in the Motiion app using `expo-notifications` with Convex backend integration.

## Current Configuration

### Dependencies

- `expo-notifications`: 0.31.5-canary (SDK 54 compatible)
- Platform: iOS & Android
- Backend: Convex

### App Configuration

- Notification icon: `./assets/notification-icon.png` (96x96px)
- Brand color: `#003D37`
- iOS entitlements: Already configured for production notifications
- Android permissions: Camera, storage, boot completed, wake lock, alarms

## Implementation Steps

### 1. Permission Handling

```typescript
import * as Notifications from 'expo-notifications';

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Notification permissions not granted');
  }

  return status;
}
```

### 2. Token Registration

```typescript
import * as Device from 'expo-device';

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    throw new Error('Push notifications only work on physical devices');
  }

  await requestNotificationPermissions();

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: '26b62811-8f3e-4bab-9548-9ab85dfa7cb2',
  });

  return token.data;
}
```

### 3. Convex Integration

#### Backend Function (convex/notifications.ts)

```typescript
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const savePushToken = mutation({
  args: {
    userId: v.id('users'),
    token: v.string(),
    platform: v.union(v.literal('ios'), v.literal('android')),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('pushTokens', {
      userId: args.userId,
      token: args.token,
      platform: args.platform,
      createdAt: Date.now(),
    });
  },
});
```

#### Client Usage

```typescript
import { useMutation } from 'convex/react';
import { api } from '@packages/backend';

const savePushToken = useMutation(api.notifications.savePushToken);

// In your auth flow or settings screen
useEffect(() => {
  registerForPushNotifications()
    .then((token) => {
      savePushToken({
        userId: user.id,
        token,
        platform: Platform.OS as 'ios' | 'android',
      });
    })
    .catch(console.error);
}, [user.id]);
```

### 4. Notification Handling

```typescript
import { useEffect, useRef } from 'react';

export function useNotificationHandler() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Handle notifications when app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification interactions
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      // Navigate based on notification data
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}
```

## Assets Required

### Notification Icon

Create `apps/native/assets/notification-icon.png`:

- Size: 96x96px
- Format: PNG with transparency
- Design: Monochrome version of app icon
- Background: Transparent

## Testing

### Development Testing

```bash
# Send test notification via Expo CLI
npx expo send-notification --to ExpoPushToken[YOUR_TOKEN] --title "Test" --body "Hello World"
```

### Production Testing

- Use Expo Push Tool: https://expo.dev/notifications
- Test with actual device tokens
- Verify delivery across iOS and Android

## Best Practices

1. **Permission Timing**: Request permissions contextually, not immediately on app launch
2. **Token Management**: Update tokens on app updates and user changes
3. **Graceful Degradation**: App should function without notification permissions
4. **Deep Linking**: Use notification data for navigation
5. **Badge Management**: Update app badge count appropriately

## Troubleshooting

- **iOS**: Ensure provisioning profile includes push notification capability
- **Android**: Verify Google Services configuration
- **Expo Go**: Notifications work differently in development
- **Physical Devices**: Always test on real devices for push notifications
