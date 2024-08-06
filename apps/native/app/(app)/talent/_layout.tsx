import { LightHeader } from '@/components/header'
import { Tabs } from 'expo-router/tabs'

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ header: LightHeader }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="settings" />
    </Tabs>
  )
}
