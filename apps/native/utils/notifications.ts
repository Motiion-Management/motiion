import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined'

export async function requestNotificationPermissions(): Promise<PushPermissionStatus> {
  const settings = await Notifications.getPermissionsAsync()
  if (settings.status === 'granted') return 'granted'
  const { status } = await Notifications.requestPermissionsAsync()
  return status as PushPermissionStatus
}

export async function registerForPushNotifications(): Promise<string | null> {
  const status = await requestNotificationPermissions()
  if (status !== 'granted') return null

  // Try to pick projectId from config; fall back to hardcoded if missing
  const projectId =
    (Constants?.expoConfig as any)?.extra?.eas?.projectId ||
    (Constants?.easConfig as any)?.projectId ||
    '26b62811-8f3e-4bab-9548-9ab85dfa7cb2'

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId })
    return token.data
  } catch {
    return null
  }
}
